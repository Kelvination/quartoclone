import type { GameState } from '../engine/quarto'
import { isPlacementAllowed, pieceById, detectAnyWin } from '../engine/quarto'
import { PieceIcon } from './PieceIcon'

export function BoardView({ state, onPlace }: { state: GameState; onPlace: (row: number, col: number) => void }) {
  const winning = detectAnyWin(state)
  return (
    <div className="board">
      {state.board.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          const can = isPlacementAllowed(state, rIdx, cIdx)
          const isLast = state.lastPlacement && state.lastPlacement.row === rIdx && state.lastPlacement.col === cIdx
          const isWinningCell = winning?.some(([rr, cc]) => rr === rIdx && cc === cIdx)
          const className = [
            'cell',
            can ? 'can' : '',
            isLast ? 'last' : '',
            isWinningCell ? 'win' : ''
          ].filter(Boolean).join(' ')
          return (
            <button
              key={`${rIdx}-${cIdx}`}
              onClick={() => can && onPlace(rIdx, cIdx)}
              disabled={cell !== null || state.phase !== 'place' || state.pieceInHand === null}
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


