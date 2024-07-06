import React, { useState } from 'react';
import './App.css';
import './App.css';
import VideoChat from './VideoChat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import Login from './Login';


function App() {
  const [loginUserInfo, setLoginUserInfo] = useState(null);
  const quitHandle = () => {
    window.location.reload();
  }


  return (
    <div className='App'>
      <header>

      </header>

      <div>
        {/* ...他のコンポーネント */}
        <Login setLoginUserInfo={setLoginUserInfo} />
      </div>

      <div className="video-menu">

      </div>
      {loginUserInfo && (
        <div className={`${loginUserInfo ? "user-logged-in" : "hide"}`}>
          <p>ユーザー名:{loginUserInfo && loginUserInfo.username}</p>
          <p>ユーザーID:{loginUserInfo && loginUserInfo.userid}</p>
        </div>
      )}

      <div className='comunity-wrap'>
        {loginUserInfo && (
          <div className="video-chat-area">
            <VideoChat loginUserName={loginUserInfo.username} />
          </div>
        )}
      </div>

      <div className={loginUserInfo ? 'hide' : 'download-area'}>
        <p><a href='https://nk-kimiya.github.io/portfolio-site/#'>Profile</a></p>
      </div>

      <footer className={loginUserInfo ? 'hide' : 'footer'}>

        <div className='social-lin-wrap'>
          <a href="https://twitter.com/intent/tweet?text=素晴らしいサイトを見つけました！&url=http://example.com" target="_blank" className='twitter-area'>
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=http://example.com" target="_blank" className='facebook-area'>
            <FontAwesomeIcon icon={faFacebook} />
          </a>
        </div>
      </footer>

    </div>
  );
}
export default App;
