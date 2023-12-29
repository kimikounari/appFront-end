import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import config from './config'
let socket;
export const Chat = (props) => {
  const componentRef = useRef(null);
  const [chatmessage, chatmessageSet] = useState('');
  const [receivechatmessage, receivechatmessageSet] = useState([]);
  const { loginUserInfo } = props;
  const [allUsers, setAllUsers] = useState([]);
  const [participantDisplay, setParticipantDisplay] = useState(false);
  const avatars = [
    '/DefaultAvatar.png',  // 例: public/DefaultAvatar.png
    '/character_one.png'   // 例: public/AnotherAvatar.png
  ];

  useEffect(() => {
    socket = io(config.REACT_APP_CHAT_SOCKET_URL);
    socket.on('connect', () => {

      socket.emit('userInfo', loginUserInfo);
    });

    socket.on('allUsersInfo', (usersInfo) => {
      setAllUsers(usersInfo);
    });

    socket.on('userDisconnected', (disconnectedUserId) => {
      window.location.reload();
    });

    socket.on('otherUserInfo', (otherUserInfo) => {

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
    socket.emit('chatMessage', loginUserInfo.username + ':' + chatmessage);
  };

  const chatmessageUpdate = (e) => {
    chatmessageSet(e.target.value);
  };

  const [chatAreaStatus, setChatAreaStatus] = useState(false);

  const chatareaShowHide = () => {
    setChatAreaStatus(!chatAreaStatus);
  }

  const participantHandle = () => {
    setParticipantDisplay(prevState => !prevState);
  }

  return (
    <div>
      {/* TODO:接続してるユーザーの名前とアバター
      の画像を表示してレイアウトを整える */}
      <div className='connection-user-info-btn' onClick={participantHandle}>
        <FontAwesomeIcon icon={faUsersViewfinder} className='participant-icon' />
        <small>参加者</small>
      </div>
      <div className={`${participantDisplay ? "connection-user-info" : "hide"}`}>
        <FontAwesomeIcon icon={faCircleXmark} className='close-icon' onClick={participantHandle} />
        {allUsers.map((user, index) => (
          // 複数の要素を <li> で囲む
          <li key={index}>
            <small className='connection-user'>{user.username}</small>
            <img src={avatars[user.avatart_number - 1]} alt="Avatar" className='connection-avatar' />
          </li>
        ))}
      </div>

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


