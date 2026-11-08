import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './styles/tailwind.css'
import './styles/index.scss'
import App from './App'

// Ensure local dev & subpath routing synchronizes cleanly with React Router basename
const baseUrl = import.meta.env.BASE_URL || '/';
const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

if (normalizedBase && !window.location.pathname.startsWith(normalizedBase)) {
  const targetPath = `${normalizedBase}${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.history.replaceState(null, '', targetPath);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

