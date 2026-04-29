import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { seedPerformanceDataset } from './lib/database'
import './styles/globals.css'

declare global {
  interface Window {
    __STINGFIT_DEBUG__?: {
      seedPerformanceDataset: typeof seedPerformanceDataset
    }
  }
}

if (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') {
  window.__STINGFIT_DEBUG__ = {
    seedPerformanceDataset,
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
