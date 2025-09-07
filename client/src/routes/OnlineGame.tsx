import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { nanoid } from 'nanoid'
import type { GameState } from '../engine/quarto'
import { ALL_PIECES, createInitialState, placePiece, selectPieceForOpponent } from '../engine/quarto'
import { BoardView } from '../ui/BoardView'
import { PieceTray } from '../ui/PieceTray'
import { TurnBanner } from '../ui/TurnBanner'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5175'

export default function OnlineGame() {
  const params = useParams()
  const navigate = useNavigate()
  const [roomId, setRoomId] = useState<string | null>(params.roomId || null)
  const [playerId] = useState<string>(() => nanoid(6))
  const [players, setPlayers] = useState<string[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [state, setState] = useState<GameState>(() => createInitialState())
  const [rematchState, setRematchState] = useState<'none' | 'requested' | 'waiting' | 'incoming'>('none')
  const [rematchMessage, setRematchMessage] = useState('')

  const pieces = useMemo(() => ALL_PIECES, [])

  useEffect(() => {
    const s = io(SERVER_URL)
    setSocket(s)
    return () => { s.disconnect() }
  }, [])

  useEffect(() => {
    if (!socket) return
    if (roomId) socket.emit('join', { roomId })
    
    socket.on('players', (ids: string[]) => setPlayers(ids))
    socket.on('state', (remote: GameState) => {
      setState(remote)
      // Reset rematch state when new game starts
      if (remote.winner === null && rematchState !== 'none') {
        setRematchState('none')
        setRematchMessage('')
      }
    })
    
    socket.on('rematchRequested', ({ requesterId }) => {
      console.log('Received rematch request from:', requesterId)
      setRematchState('incoming')
      setRematchMessage('Your opponent wants to play again!')
    })
    
    socket.on('rematchAccepted', () => {
      // Start new game
      const newState = createInitialState()
      setState(newState)
      setRematchState('none')
      setRematchMessage('')
      if (socket && roomId) {
        socket.emit('state', { roomId, state: newState })
      }
    })
    
    socket.on('rematchDeclined', ({ declinerId, reason }) => {
      setRematchState('none')
      if (reason === 'disconnect') {
        setRematchMessage('Your opponent left the game.')
      } else {
        setRematchMessage('Your opponent declined to play again.')
      }
      setTimeout(() => setRematchMessage(''), 3000)
    })
    
    return () => {
      socket.off('players')
      socket.off('state')
      socket.off('rematchRequested')
      socket.off('rematchAccepted')
      socket.off('rematchDeclined')
    }
  }, [socket, roomId, rematchState])

  async function createRoom() {
    const res = await fetch(`${SERVER_URL}/create`)
    const data = await res.json()
    setRoomId(data.id)
    navigate(`/online/${data.id}`)
  }

  function broadcast(next: GameState) {
    setState(next)
    if (socket && roomId) socket.emit('state', { roomId, state: next })
  }

  function requestRematch() {
    if (socket && roomId) {
      console.log('Requesting rematch for room:', roomId)
      setRematchState('waiting')
      setRematchMessage('Waiting for opponent to accept...')
      socket.emit('requestRematch', { roomId })
    }
  }

  function acceptRematch() {
    if (socket && roomId) {
      setRematchState('waiting')
      setRematchMessage('Starting new game...')
      socket.emit('requestRematch', { roomId })
    }
  }

  function declineRematch() {
    if (socket && roomId) {
      setRematchState('none')
      setRematchMessage('')
      socket.emit('declineRematch', { roomId })
    }
  }

  if (!roomId) {
    return (
      <div className="container">
        <div className="card" style={{ padding: 24, maxWidth: 640 }}>
          <h2 className="title">Online Game</h2>
          <p className="subtitle">Create a room and share the link</p>
          <div className="row">
            <button className="btn primary" onClick={createRoom}>Create room</button>
          </div>
        </div>
      </div>
    )
  }

  const isPlayerOne = players.length ? players[0] === (socket?.id ?? '') : true
  const myPlayerNumber = isPlayerOne ? 0 : 1
  const myTurn = state.currentPlayer === myPlayerNumber

  return (
    <div className="container">
      <div className="card" style={{ padding: 16, width: 'min(92vw, 960px)' }}>
        <h2 className="title">Online Room {roomId}</h2>
        <TurnBanner state={state} isMyTurn={myTurn} myPlayerNumber={myPlayerNumber} />
        
        {/* Rematch message */}
        {rematchMessage && (
          <div className="rematchMessage">
            <span className="badge">{rematchMessage}</span>
          </div>
        )}
        
        {/* Game over actions */}
        {state.winner !== null && (
          <div className="gameOverActions">
            {rematchState === 'none' && !rematchMessage && (
              <>
                <button className="btn primary" onClick={requestRematch}>Play Again</button>
                <button className="btn" onClick={() => window.location.href = '/'}>Back to Lobby</button>
              </>
            )}
            {rematchState === 'waiting' && (
              <button className="btn" onClick={() => window.location.href = '/'}>Back to Lobby</button>
            )}
            {rematchState === 'incoming' && (
              <>
                <button className="btn success" onClick={acceptRematch}>Yes, Play Again</button>
                <button className="btn" onClick={declineRematch}>No Thanks</button>
              </>
            )}
            {rematchMessage && rematchState === 'none' && (
              <button className="btn" onClick={() => window.location.href = '/'}>Back to Lobby</button>
            )}
          </div>
        )}
        <div className="space" />
        <BoardView state={state} onPlace={(r,c)=> myTurn && broadcast(placePiece(state, r, c))} isMyTurn={myTurn} />
        <div className="space" />
        <PieceTray
          pieces={pieces}
          available={state.availablePieceIds}
          selectedId={state.pieceInHand}
          phase={state.phase}
          onSelect={(id)=> myTurn && broadcast(selectPieceForOpponent(state, id))}
          isMyTurn={myTurn}
        />
        <div className="space" />
        <div className="row"><small className="subtitle">Share: {typeof window !== 'undefined' ? window.location.href : ''}</small></div>
      </div>
    </div>
  )
}


