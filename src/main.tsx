import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { useEditorStore } from './store/useEditorStore'
import './index.css'
import '@xyflow/react/dist/style.css'

// Apply theme from localStorage before rendering
const theme = useEditorStore.getState().theme;
document.documentElement.setAttribute('data-theme', theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
