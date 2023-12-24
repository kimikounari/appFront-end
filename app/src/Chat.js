import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import config from './config'
let socket;
export const Chat = (props) => {
  const componentRef = useRef(null);
  const [chatmessage, chatmessageSet] = useState('');
  const [receivechatmessage, receivechatmessageSet] = useState([]);
  const { loginUserInfo } = props;
  const [allUsers, setAllUsers] = useState([]);
  useEffect(() => {
    socket = io(config.REACT_APP_CHAT_SOCKET_URL);
    socket.on('connect', () => {

      socket.emit('userInfo', loginUserInfo);
    });

    socket.on('allUsersInfo', (usersInfo) => {
      console.log('Received all users info:', usersInfo);
      setAllUsers(usersInfo);
    });

    socket.on('otherUserInfo', (otherUserInfo) => {
      console.log('Other User Info:', otherUserInfo);
    });
    socket.on('chatMessage', (msg) => {
      receivechatmessageSet((prevItems) => [...prevItems, msg]);
      chatmessageSet('');
    });
    socket.on('userDisconnected', (disconnectedUserId) => {
      setAllUsers(currentUsers => currentUsers.filter(user => user.id !== disconnectedUserId));
    });

    return () => {
      socket.off('userDisconnected');
      socket.disconnect();
    };
  }, [loginUserInfo]);

  const chatmessageSend = (e) => {
    socket.emit('chatMessage', loginUserInfo.name + ':' + chatmessage);
  };

  const chatmessageUpdate = (e) => {
    chatmessageSet(e.target.value);
  };

  const [chatAreaStatus, setChatAreaStatus] = useState(false);

  const chatareaShowHide = () => {
    setChatAreaStatus(!chatAreaStatus);
  }

  return (
    <div>
      {/* TODO:接続してるユーザーの名前とアバター
      の画像を表示してレイアウトを整える */}
      <ul>
        {allUsers.map((user, index) => (
          <li key={index}>{user.name}</li>
        ))}
      </ul>
      <div className="chat-area-component">
        <div onClick={chatareaShowHide} className='chat-area-status-btn'>
          {chatAreaStatus ? <FontAwesomeIcon icon={faChevronLeft} className='icon' /> : <FontAwesomeIcon icon={faComment} className='icon' />}
          {chatAreaStatus ? <p className='chat-area-close-text'>閉じる×</p> : <p className='chat-area-status-text'>チャット</p>}
        </div>
        <div className={chatAreaStatus ? "chat-area" : "hide"}>
          <ul ref={componentRef} className='message'>
            {receivechatmessage.map((item, index) => (
              <li key={index} className='chat-message'>{item}</li>
            ))}
          </ul>
          <div className='send-area'>
            <input type="text" value={chatmessage} onChange={chatmessageUpdate} className='send-field'></input>
            <button onClick={chatmessageSend} className='send-btn'><FontAwesomeIcon icon={faPaperPlane} className='chat_send_icon' /></button>
          </div>
        </div>
      </div>
    </div>
  )
}


