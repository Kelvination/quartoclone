export type Attribute = 'color' | 'height' | 'shape' | 'fill';
export type Color = 'light' | 'dark';
export type Height = 'tall' | 'short';
export type Shape = 'square' | 'round';
export type Fill = 'solid' | 'hollow';

export type Piece = {
  id: number; // 0..15
  color: Color;
  height: Height;
  shape: Shape;
  fill: Fill;
};

export type Cell = number | null; // piece id index or null
export type Board = (Cell[])[]; // 4x4

export type TurnPhase =
  | 'place' // place the given piece
  | 'select'; // select a piece for opponent

export interface Rules {
  allowDiagonals: boolean; // standard: true
  allowSquare2x2: boolean; // variant: false by default
  requireCallQuarto: boolean; // if true, must press Quarto button; else auto-detect
}

export interface GameState {
  board: Board;
  availablePieceIds: number[]; // remaining
  currentPlayer: 0 | 1; // player to act on this phase
  phase: TurnPhase;
  pieceInHand: number | null; // id picked by opponent, to be placed
  rules: Rules;
  winner: 0 | 1 | 'draw' | null;
  lastPlacement?: { row: number; col: number; pieceId: number };
}

export const ALL_PIECES: Piece[] = (() => {
  const pieces: Piece[] = [];
  let id = 0;
  const colors: Color[] = ['light', 'dark'];
  const heights: Height[] = ['tall', 'short'];
  const shapes: Shape[] = ['square', 'round'];
  const fills: Fill[] = ['solid', 'hollow'];
  for (const color of colors) {
    for (const height of heights) {
      for (const shape of shapes) {
        for (const fill of fills) {
          pieces.push({ id, color, height, shape, fill });
          id += 1;
        }
      }
    }
  }
  return pieces;
})();

export function createEmptyBoard(): Board {
  return Array.from({ length: 4 }, () => Array<Cell>(4).fill(null));
}

export function createInitialState(rules?: Partial<Rules>): GameState {
  const mergedRules: Rules = {
    allowDiagonals: true,
    allowSquare2x2: false,
    requireCallQuarto: false,
    ...rules,
  };
  return {
    board: createEmptyBoard(),
    availablePieceIds: ALL_PIECES.map((p) => p.id),
    currentPlayer: 0,
    phase: 'select',
    pieceInHand: null,
    rules: mergedRules,
    winner: null,
  };
}

export function pieceById(id: number): Piece {
  const p = ALL_PIECES[id];
  if (!p) throw new Error(`Invalid piece id ${id}`);
  return p;
}

export function removeAvailable(state: GameState, pieceId: number): void {
  state.availablePieceIds = state.availablePieceIds.filter((id) => id !== pieceId);
}

export function isPlacementAllowed(state: GameState, row: number, col: number): boolean {
  return state.phase === 'place' && state.pieceInHand !== null && state.board[row][col] === null;
}

export function placePiece(state: GameState, row: number, col: number): GameState {
  if (!isPlacementAllowed(state, row, col)) return state;
  const pieceId = state.pieceInHand as number;
  const next: GameState = { ...state, board: state.board.map((r) => r.slice()), lastPlacement: { row, col, pieceId } };
  next.board[row][col] = pieceId;
  next.pieceInHand = null;

  // Detect win
  const winning = detectAnyWin(next);
  if (winning) {
    if (next.rules.requireCallQuarto) {
      // stop at select phase until player calls Quarto explicitly; store pending
      next.phase = 'select';
      next.winner = (next.currentPlayer as 0 | 1); // provisional; UI may require confirm
    } else {
      next.winner = next.currentPlayer as 0 | 1;
    }
    return next;
  }

  // If board is full after placement and no win
  const anyFree = next.board.some((rowArr) => rowArr.some((c) => c === null));
  if (!anyFree) {
    next.winner = 'draw';
    return next;
  }

  // Switch to select phase for the same player to select a piece FOR opponent
  next.phase = 'select';
  return next;
}

export function isSelectionAllowed(state: GameState, pieceId: number): boolean {
  return state.phase === 'select' && state.availablePieceIds.includes(pieceId);
}

export function selectPieceForOpponent(state: GameState, pieceId: number): GameState {
  if (!isSelectionAllowed(state, pieceId)) return state;
  const next: GameState = { ...state };
  removeAvailable(next, pieceId);
  // pass piece to opponent; opponent will place
  next.pieceInHand = pieceId;
  next.phase = 'place';
  // switch current player to opponent
  next.currentPlayer = (next.currentPlayer === 0 ? 1 : 0);
  return next;
}

export function linesToCheck(rules: Rules): number[][][] {
  const lines: number[][][] = [];
  // Rows and columns
  for (let i = 0; i < 4; i++) {
    lines.push(
      [ [i,0], [i,1], [i,2], [i,3] ],
      [ [0,i], [1,i], [2,i], [3,i] ],
    );
  }
  if (rules.allowDiagonals) {
    lines.push(
      [ [0,0], [1,1], [2,2], [3,3] ],
      [ [0,3], [1,2], [2,1], [3,0] ],
    );
  }
  return lines;
}

export function hasCommonAttribute(pieceIds: number[]): boolean {
  if (pieceIds.length !== 4) return false;
  const pieces = pieceIds.map(pieceById);
  const attrs: Attribute[] = ['color', 'height', 'shape', 'fill'];
  for (const attr of attrs) {
    const v = pieces.map((p) => p[attr as keyof Piece] as unknown as string);
    if (v.every((x) => x === v[0])) return true;
  }
  return false;
}

export function detectLineWin(state: GameState): number[][] | null {
  const lns = linesToCheck(state.rules);
  for (const line of lns) {
    const ids = line.map(([r, c]) => state.board[r][c]);
    if (ids.every((id) => id !== null) && hasCommonAttribute(ids as number[])) {
      return line;
    }
  }
  return null;
}

export function detectSquare2x2Win(state: GameState): number[][] | null {
  if (!state.rules.allowSquare2x2) return null;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cells = [ [r,c], [r,c+1], [r+1,c], [r+1,c+1] ];
      const ids = cells.map(([rr, cc]) => state.board[rr][cc]);
      if (ids.every((id) => id !== null) && hasCommonAttribute(ids as number[])) {
        return cells;
      }
    }
  }
  return null;
}

export function detectAnyWin(state: GameState): number[][] | null {
  return detectLineWin(state) || detectSquare2x2Win(state);
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(payload: string): GameState {
  const obj = JSON.parse(payload) as GameState;
  return obj;
}


