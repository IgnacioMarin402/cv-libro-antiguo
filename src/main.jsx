import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { MobileNotice, isMobileDevice } from '@/features/mobileNotice'
import './index.css'

// A phone or a tablet never mounts the room: it would start loading the
// models, and the browser would close the tab before they're up (see
// features/mobileNotice).
createRoot(document.getElementById('root')).render(
  <StrictMode>{isMobileDevice(navigator) ? <MobileNotice /> : <App />}</StrictMode>
)
