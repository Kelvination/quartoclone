import { useMemo, useState } from 'react'
import type { GameState } from '../engine/quarto'
import { ALL_PIECES, createInitialState, placePiece, selectPieceForOpponent } from '../engine/quarto'
import { BoardView } from '../ui/BoardView'
import { PieceTray } from '../ui/PieceTray'
import { TurnBanner } from '../ui/TurnBanner'

export default function LocalGame() {
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [pendingResetKey, setPendingResetKey] = useState(0)

  const pieces = useMemo(() => ALL_PIECES, [])

  return (
    <div className="container" key={pendingResetKey}>
      <div className="card" style={{ padding: 16 }}>
        <h2 className="title">Local Pass-and-Play</h2>
        <TurnBanner state={state} />
        {state.winner !== null && (
          <div className="gameOverActions">
            <button className="btn" onClick={() => window.location.href = '/'}>Back to Lobby</button>
          </div>
        )}
        <div className="space" />
        <BoardView state={state} onPlace={(r,c)=> setState(s=> placePiece(s, r, c))} />
      </div>

      <div className="space" />

      <div className="card" style={{ padding: 16 }}>
        <PieceTray
          pieces={pieces}
          available={state.availablePieceIds}
          selectedId={state.pieceInHand}
          phase={state.phase}
          onSelect={(id)=> setState(s=> selectPieceForOpponent(s, id))}
          isMyTurn={true}
        />
      </div>

      <div className="space" />
      <div className="row">
        <button className="btn" onClick={()=> { setState(createInitialState()); setPendingResetKey(k=>k+1) }}>Reset</button>
      </div>
    </div>
  )
}


