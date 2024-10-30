import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { RecordProvider } from './RecordContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RecordProvider>
        <App />
      </RecordProvider>
    </BrowserRouter>
  </StrictMode>
);
