import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div className="container">
      <div className="card" style={{ padding: 24, maxWidth: 640 }}>
        <h1 className="title">Quarto</h1>
        <p className="subtitle">Choose a mode to start playing</p>
        <div className="row">
          <Link className="btn primary" to="/local">Local Pass-and-Play</Link>
          <button className="btn" onClick={() => navigate('/online')}>Online (create/join)</button>
        </div>
      </div>
    </div>
  )
}


