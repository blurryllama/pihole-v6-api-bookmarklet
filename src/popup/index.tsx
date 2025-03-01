import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from './Popup';

// Wait for the DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<Popup />);
  } else {
    console.error('Root element not found');
  }
}); 