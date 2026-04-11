import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// PrimeReact Styles
import "primereact/resources/themes/lara-light-blue/theme.css";  // Light Blue Theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "aos/dist/aos.css"; // AOS Animations

import { PrimeReactProvider } from 'primereact/api';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>,
)
