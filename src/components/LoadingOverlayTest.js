import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';
import './LoadingOverlayTest.css';

const LoadingOverlayTest = () => {
  const [showOverlay1, setShowOverlay1] = useState(false);
  const [showOverlay2, setShowOverlay2] = useState(false);
  const [showOverlay3, setShowOverlay3] = useState(false);

  const handleTest1 = () => {
    setShowOverlay1(true);
  };

  const handleTest2 = () => {
    setShowOverlay2(true);
  };

  const handleTest3 = () => {
    setShowOverlay3(true);
  };

  return (
    <div className="loading-test">
      {/* Test 1: 3 second overlay */}
      {showOverlay1 && (
        <LoadingOverlay 
          duration={3000}
          onComplete={() => {
            setShowOverlay1(false);
            console.log('Test 1 completed - 3 seconds');
          }}
        />
      )}

      {/* Test 2: 5 second overlay with longer fade */}
      {showOverlay2 && (
        <LoadingOverlay 
          duration={5000}
          fadeOutDuration={1000}
          onComplete={() => {
            setShowOverlay2(false);
            console.log('Test 2 completed - 5 seconds with 1s fade');
          }}
        />
      )}

      {/* Test 3: Custom animation (if you have one) */}
      {showOverlay3 && (
        <LoadingOverlay 
          duration={4000}
          lottieUrl="https://lottie.host/f1d88f62-1215-445c-97a6-23ebc66bbfae/1x4cJ9vmdm.lottie"
          fadeOutDuration={800}
          onComplete={() => {
            setShowOverlay3(false);
            console.log('Test 3 completed - 4 seconds custom');
          }}
        />
      )}

      <div className="test-content">
        <h1>LoadingOverlay Test Page</h1>
        <p>Click the buttons below to test different LoadingOverlay configurations:</p>
        
        <div className="test-buttons">
          <button 
            onClick={handleTest1}
            className="test-button"
          >
            Test 1: 3 Second Overlay
          </button>
          
          <button 
            onClick={handleTest2}
            className="test-button"
          >
            Test 2: 5 Second with Long Fade
          </button>
          
          <button 
            onClick={handleTest3}
            className="test-button"
          >
            Test 3: 4 Second Custom
          </button>
        </div>

        <div className="instructions">
          <h3>How to use LoadingOverlay in your components:</h3>
          <ol>
            <li>Import: <code>import LoadingOverlay from './LoadingOverlay';</code></li>
            <li>Add state: <code>const [showLoading, setShowLoading] = useState(true);</code></li>
            <li>Use in JSX: <code>{`{showLoading && <LoadingOverlay duration={5000} onComplete={() => setShowLoading(false)} />}`}</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlayTest;
