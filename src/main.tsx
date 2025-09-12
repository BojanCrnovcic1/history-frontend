import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.ts'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider.tsx'
import { MusicProvider } from './context/MusicContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
     <MusicProvider>
     <AuthProvider>
        <App />
      </AuthProvider>
     </MusicProvider>
      
    </BrowserRouter>
  </StrictMode>,
)