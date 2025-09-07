import type { GameState } from '../engine/quarto'
import { pieceById } from '../engine/quarto'
import { PieceIcon } from './PieceIcon'

export function TurnBanner({ 
  state, 
  isMyTurn = true, 
  myPlayerNumber = null 
}: { 
  state: GameState
  isMyTurn?: boolean
  myPlayerNumber?: number | null
}) {
  const opponent = state.currentPlayer === 0 ? 1 : 0
  let text = ''
  let isGameOver = false
  
  if (state.winner === 'draw') {
    text = 'Draw'
    isGameOver = true
  } else if (state.winner === 0 || state.winner === 1) {
    const winnerText = myPlayerNumber !== null 
      ? (state.winner === myPlayerNumber ? 'You win!' : 'You lose!')
      : `Player ${Number(state.winner) + 1} wins!`
    text = winnerText
    isGameOver = true
  } else if (state.phase === 'select') {
    if (myPlayerNumber !== null) {
      text = isMyTurn 
        ? `Your turn: Select a piece for Player ${opponent + 1}.`
        : `Player ${state.currentPlayer + 1} is selecting a piece for you.`
    } else {
      text = `Player ${state.currentPlayer + 1}: Select a piece for Player ${opponent + 1}.`
    }
  } else {
    if (myPlayerNumber !== null) {
      text = isMyTurn 
        ? 'Your turn: Place the highlighted piece on the board.'
        : `Player ${state.currentPlayer + 1} is placing the piece.`
    } else {
      text = `Player ${state.currentPlayer + 1}: Place the highlighted piece on the board.`
    }
  }

  const showPreview = state.phase === 'place' && state.pieceInHand !== null

  return (
    <div className={`turnBanner ${isMyTurn && !isGameOver ? 'myTurn' : ''}`}>
      <div className="turnText">
        <span className={`badge ${isMyTurn && !isGameOver ? 'active' : ''}`}>
          {isGameOver ? 'Game Over' : 'Turn'}
        </span>
        <span>{text}</span>
        {myPlayerNumber !== null && (
          <span className="playerIdentity">You are Player {myPlayerNumber + 1}</span>
        )}
      </div>
      {showPreview && (
        <div className="piecePreview glow">
          <PieceIcon piece={pieceById(state.pieceInHand as number)} />
        </div>
      )}
    </div>
  )
}


