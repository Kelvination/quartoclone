import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './routes/Home'
import LocalGame from './routes/LocalGame'
import OnlineGame from './routes/OnlineGame'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/local', element: <LocalGame /> },
  { path: '/online/:roomId?', element: <OnlineGame /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
