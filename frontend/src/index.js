import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global reset — ensures body/html match the dark theme
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #0A0A0A; color: #FFFFFF; font-family: sans-serif; }
  #root { height: 100%; }
`;
document.head.appendChild(globalStyle);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
