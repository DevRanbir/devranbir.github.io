# LoadingOverlay Component

A reusable React component that displays a full-screen loading overlay with a Lottie animation on a pitch-black background. Perfect for page loading states with smooth fade-out transitions.

## Features

- 🌑 **Full-screen pitch-black background**
- 🎭 **Lottie animation support**
- ⏱️ **Customizable duration**
- 🎭 **Smooth fade-out transition**
- 📱 **Responsive design**
- 🎯 **Easy integration**

## Installation

The component is already created in your project at:
```
src/components/LoadingOverlay.js
src/components/LoadingOverlay.css
```

## Basic Usage

### 1. Import the component
```javascript
import LoadingOverlay from './LoadingOverlay';
```

### 2. Add state to control visibility
```javascript
const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);
```

### 3. Use in your component
```javascript
return (
  <div className="your-page">
    {/* LoadingOverlay - Shows for specified time on page load */}
    {showLoadingOverlay && (
      <LoadingOverlay 
        duration={5000}
        onComplete={() => setShowLoadingOverlay(false)}
      />
    )}
    
    {/* Your page content */}
    <div className="page-content">
      {/* ... */}
    </div>
  </div>
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `duration` | number | 3000 | Total time in milliseconds the overlay should be visible |
| `lottieUrl` | string | default animation | URL to your Lottie animation file |
| `fadeOutDuration` | number | 500 | Duration of the fade-out transition in milliseconds |
| `onComplete` | function | undefined | Callback function called when the overlay is completely hidden |

## Usage Examples

### Example 1: Homepage with 5-second loading
```javascript
import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

const Homepage = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  return (
    <div className="homepage">
      {showLoadingOverlay && (
        <LoadingOverlay 
          duration={5000}
          onComplete={() => setShowLoadingOverlay(false)}
        />
      )}
      
      <div className="homepage-content">
        <h1>Welcome to Homepage</h1>
        {/* Your content */}
      </div>
    </div>
  );
};
```

### Example 2: Projects page with custom animation
```javascript
import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

const Projects = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  return (
    <div className="projects">
      {showLoadingOverlay && (
        <LoadingOverlay 
          duration={3000}
          lottieUrl="https://lottie.host/your-custom-animation-url/animation.lottie"
          fadeOutDuration={800}
          onComplete={() => {
            setShowLoadingOverlay(false);
            console.log('Projects page loaded!');
          }}
        />
      )}
      
      <div className="projects-content">
        <h1>My Projects</h1>
        {/* Your projects */}
      </div>
    </div>
  );
};
```

### Example 3: Contact page with longer fade-out
```javascript
import React, { useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

const Contact = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(true);

  return (
    <div className="contact">
      {showLoadingOverlay && (
        <LoadingOverlay 
          duration={4000}
          fadeOutDuration={1000}
          onComplete={() => setShowLoadingOverlay(false)}
        />
      )}
      
      <div className="contact-content">
        <h1>Contact Me</h1>
        {/* Your contact content */}
      </div>
    </div>
  );
};
```

### Example 4: Conditional loading (only show once per session)
```javascript
import React, { useState, useEffect } from 'react';
import LoadingOverlay from './LoadingOverlay';

const About = () => {
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  useEffect(() => {
    // Only show loading if user hasn't seen it in this session
    const hasSeenLoading = sessionStorage.getItem('aboutPageLoaded');
    if (!hasSeenLoading) {
      setShowLoadingOverlay(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    setShowLoadingOverlay(false);
    sessionStorage.setItem('aboutPageLoaded', 'true');
  };

  return (
    <div className="about">
      {showLoadingOverlay && (
        <LoadingOverlay 
          duration={3500}
          onComplete={handleLoadingComplete}
        />
      )}
      
      <div className="about-content">
        <h1>About Me</h1>
        {/* Your about content */}
      </div>
    </div>
  );
};
```

## Customization

### Custom Lottie Animation
Replace the default animation by providing your own Lottie URL:
```javascript
<LoadingOverlay 
  lottieUrl="https://lottie.host/your-animation-id/your-animation.lottie"
  duration={4000}
/>
```

### Custom Styling
You can override the CSS by targeting these classes:
```css
.loading-overlay {
  /* Override background color, z-index, etc. */
}

.loading-overlay__content {
  /* Override animation size, positioning */
}
```

## Integration with Router

For React Router pages, add the LoadingOverlay to each route component:

```javascript
// App.js or your router setup
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import Projects from './components/Projects';
import About from './components/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}
```

Each component can have its own LoadingOverlay with different durations and animations.

## Notes

- The overlay has a z-index of 9999 to ensure it appears above all other content
- The component automatically cleans up timers when unmounted
- The fade-out transition is smooth and customizable
- The component is responsive and works on all screen sizes
- The animation scales down on smaller screens for better mobile experience
