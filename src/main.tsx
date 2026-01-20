import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    
    <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 4000,
    success: {
      className: 'bg-white text-green-800 border border-green-100',
    },
    error: {
      className: 'bg-white text-red-800 border border-red-100',
    },
  }}
/>

    <App />
    </BrowserRouter>
  </StrictMode>,
)
