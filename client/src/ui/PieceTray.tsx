import type { Piece as PieceType } from '../engine/quarto'
import { PieceIcon } from './PieceIcon'

export function PieceTray({
  pieces,
  available,
  selectedId,
  phase,
  onSelect,
  isMyTurn = true,
}: {
  pieces: PieceType[];
  available: number[];
  selectedId: number | null;
  phase: 'place' | 'select';
  onSelect: (id: number) => void;
  isMyTurn?: boolean;
}) {
  const isSelectionPhase = phase === 'select' && isMyTurn
  
  return (
    <div>
      <h3 className="title">Pieces</h3>
      <div className={`tray ${isSelectionPhase ? 'active' : ''}`}>
        {pieces.map((p: PieceType) => {
          const isAvail = available.includes(p.id)
          const isSelected = selectedId === p.id
          const canSelect = isAvail && phase === 'select' && isMyTurn
          const className = [
            'pieceButton',
            isSelected ? 'selected' : '',
            canSelect ? 'selectable' : ''
          ].filter(Boolean).join(' ')
          
          return (
            <button
              key={p.id}
              disabled={!canSelect}
              onClick={() => onSelect(p.id)}
              className={className}
              aria-label={`piece ${p.id}`}
            >
              <PieceIcon piece={p} />
            </button>
          )
        })}
      </div>
    </div>
  )
}


