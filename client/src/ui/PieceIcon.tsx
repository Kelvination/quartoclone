import type { Piece } from '../engine/quarto'

export function PieceIcon({ piece }: { piece: Piece }) {
  const stroke = piece.color === 'light' ? '#0d1b2a' : '#e6e9ef'
  const fillBody = piece.color === 'light' ? '#f5f7fb' : '#2a3346'
  const height = piece.height === 'tall' ? 64 : 44
  const radius = piece.shape === 'round' ? 18 : 6
  const innerFill = piece.fill === 'hollow' ? 'none' : stroke

  return (
    <svg width="56" height="72" viewBox="0 0 56 72" aria-hidden>
      <g transform={`translate(10, ${(72-height)/2})`}>
        <rect x="0" y="0" width="36" height={height} rx={radius} ry={radius} fill={fillBody} stroke={stroke} strokeWidth="2" />
        {piece.shape === 'round' ? (
          <circle cx="18" cy={height/2} r="8" fill={innerFill} stroke={stroke} strokeWidth="2" />
        ) : (
          <rect x="10" y={(height/2)-8} width="16" height="16" rx="3" ry="3" fill={innerFill} stroke={stroke} strokeWidth="2" />
        )}
      </g>
    </svg>
  )
}


