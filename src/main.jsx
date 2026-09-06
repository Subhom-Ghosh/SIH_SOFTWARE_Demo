import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-label="Loading BhuRakshak">
      <div className="splash-content">
        <img
          src="/assets/aistudio/image.png"
          alt="BhuRakshak"
          className="splash-logo"
        />
        <p className="splash-tagline">Mapping Today, Securing Tomorrow</p>
      </div>
    </div>
  );
}

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const splashTimer = window.setTimeout(() => setShowSplash(false), 3000);
    return () => window.clearTimeout(splashTimer);
  }, []);

  return (
    <>
      <App />
      {showSplash && <SplashScreen />}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
