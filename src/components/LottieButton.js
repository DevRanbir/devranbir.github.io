import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function LottieButton({ setActiveComponent }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/contacts');
    setActiveComponent('chatbox');
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: '-25px',
        right: '0px',
        zIndex: 1000,
        width: '250px',
        height: '250px',
        overflow: 'hidden',
        cursor: 'pointer',      // makes it clear it's clickable
      }}
    >
      <DotLottieReact
        src="https://lottie.host/f1d88f62-1215-445c-97a6-23ebc66bbfae/1x4cJ9vmdm.lottie"
        loop
        autoplay
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

export default LottieButton;
