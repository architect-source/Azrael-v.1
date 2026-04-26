import React from 'react'
import ReactDOM from 'react-dom/client'
import { AzraelCore } from './client/components/AzraelCore'
import './index.css'

// CRITICAL: Check this element exists in index.html
const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AzraelCore />
  </React.StrictMode>,
)
