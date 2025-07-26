import React, { useState, useEffect } from 'react';
import './FullScreenPrompt.css';

const FullScreenPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  // eslint-disable-next-line
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Function to detect mobile devices
    const isMobileDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      // eslint-disable-next-line no-useless-escape
      const mobileRegex = /android|bb\d+|meego|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;
      // eslint-disable-next-line no-useless-escape
      const mobileRegex2 = /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i;
      
      return mobileRegex.test(userAgent) || mobileRegex2.test(userAgent.substr(0, 4)) || window.innerWidth <= 768;
    };

    // Function to check if user is in fullscreen mode
    const isFullscreen = () => {
      return !!(document.fullscreenElement || 
                document.webkitFullscreenElement || 
                document.mozFullScreenElement || 
                document.msFullscreenElement);
    };

    // Check if prompt should be shown
    const shouldShowPrompt = () => {
      const hasSeenPrompt = localStorage.getItem('fullscreen-prompt-dismissed');
      return isMobileDevice() && !isFullscreen() && !hasSeenPrompt && !dismissed;
    };

    // Show prompt after a short delay to avoid interfering with loading
    const timer = setTimeout(() => {
      if (shouldShowPrompt()) {
        setShowPrompt(true);
      }
    }, 2000);

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      if (isFullscreen()) {
        setShowPrompt(false);
      } else if (isMobileDevice() && !dismissed && !localStorage.getItem('fullscreen-prompt-dismissed')) {
        setShowPrompt(true);
      }
    };

    // Add fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [dismissed]);

  const handleEnterFullscreen = async () => {
    try {
      const element = document.documentElement;
      
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      
      setShowPrompt(false);
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
    }
  };


  const handleRemindLater = () => {
    setShowPrompt(false);
    // Don't set dismissed or localStorage, so it can show again later
  };

  if (!showPrompt) return null;

  return (
    <div className="fullscreen-prompt-overlay">
      <div className="fullscreen-prompt glass-panel">
        <div className="fullscreen-prompt-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" fill="none" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </div>
        
        <h3>Better Experience in Fullscreen</h3>
        <p>
          For the best viewing experience on mobile, we recommend using fullscreen mode. 
          This will give you more space to explore and interact with the content.
        </p>
        
        <div className="fullscreen-prompt-buttons">
          <button 
            className="fullscreen-btn-primary" 
            onClick={handleEnterFullscreen}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
            Enter Fullscreen
          </button>
          
          <button 
            className="fullscreen-btn-secondary" 
            onClick={handleRemindLater}
          >
            Maybe Later
          </button>
          
        </div>
        
        <div className="fullscreen-prompt-tip">
          <span className="tip-icon">💡</span>
          <span>You can exit fullscreen anytime by swiping down or pressing the back button</span>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPrompt;
