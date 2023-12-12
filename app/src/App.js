//Gitのテストをかいしします
import { Chat } from './Chat';
import { UnityDisplay } from './Unity';
import React, { useState, useEffect } from 'react';
import './App.css';
import Audiochat from './Audiochat';
import './App.css';
import VideoChat from './VideoChat';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from "@fortawesome/free-solid-svg-icons"
import Login from './Login';
function App() {
  const [videoChatDisplay, setVideoChatDisplay] = useState(true);
  const [loginUserInfo, setLoginUserInfo] = useState(null);
  const handleVideoChatDisplay = () => {
    setVideoChatDisplay(!videoChatDisplay);
  }
  const quitHandle = () => {
    window.location.reload();
  }
  return (
    <div>
      <div>
        {/* ...他のコンポーネント */}
        <Login setLoginUserInfo={setLoginUserInfo} />
      </div>
      <div className='video-menu'>
        {loginUserInfo && (
          <div className={`${videoChatDisplay ? "video-chat-display-btn" : "hide"}`} onClick={handleVideoChatDisplay}>ビデオ非表示＞</div>
        )}
        {loginUserInfo && (
          <div className={`${videoChatDisplay ? "hide" : "video-chat-display-btn"}`} onClick={handleVideoChatDisplay}>ビデオ表示＜</div>
        )}
      </div>
      {loginUserInfo && (
        <div className={`${loginUserInfo ? "user-logged-in" : "hide"}`}>
          <p>ユーザー名:{loginUserInfo && loginUserInfo.name}</p>
          <p>ユーザーID:{loginUserInfo && loginUserInfo.id}</p>
        </div>
      )}
      {loginUserInfo && (
        <UnityDisplay />
      )}
      <div className='bottom-navi'>
        {loginUserInfo && (
          <div className={`${videoChatDisplay ? "video-chat-area" : "hide"}`}>
            <VideoChat loginUserName={loginUserInfo.name} />
          </div>
        )}
        {loginUserInfo && (
          <Audiochat />
        )}

        {loginUserInfo && (
          <Chat loginUserInfo={loginUserInfo} />
        )}
        {loginUserInfo && (
          <div className='exit-button' onClick={quitHandle}>
            <FontAwesomeIcon icon={faDoorOpen} className='icon' />
            <p className='exit-button-text'>退出する</p>
          </div>
        )}
      </div>

    </div>
  );
}
export default App;
