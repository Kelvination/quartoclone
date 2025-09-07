import type { GameState } from '../engine/quarto'
import { isPlacementAllowed, pieceById, detectAnyWin } from '../engine/quarto'
import { PieceIcon } from './PieceIcon'

export function BoardView({ 
  state, 
  onPlace, 
  isMyTurn = true 
}: { 
  state: GameState; 
  onPlace: (row: number, col: number) => void;
  isMyTurn?: boolean;
}) {
  const winning = detectAnyWin(state)
  return (
    <div className="board">
      {state.board.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const canPlace = isPlacementAllowed(state, rIdx, cIdx)
          const isMyPlacementTurn = canPlace && isMyTurn
          const isOpponentPlacementTurn = state.phase === 'place' && state.pieceInHand !== null && !isMyTurn && cell === null
          const isLast = state.lastPlacement && state.lastPlacement.row === rIdx && state.lastPlacement.col === cIdx
          const isWinningCell = winning?.some(([rr, cc]) => rr === rIdx && cc === cIdx)
          const className = [
            'cell',
            isMyPlacementTurn ? 'can' : '',
            isOpponentPlacementTurn ? 'waiting' : '',
            isLast ? 'last' : '',
            isWinningCell ? 'win' : ''
          ].filter(Boolean).join(' ')
          return (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => isMyPlacementTurn && onPlace(rIdx, cIdx)}
              disabled={cell !== null || !isMyPlacementTurn}
              className={className}
              aria-label={`cell ${rIdx+1}-${cIdx+1}`}
            >
              {cell !== null ? <PieceIcon piece={pieceById(cell)} /> : null}
            </button>
          )
        })
      )}
    </div>
  )
}


