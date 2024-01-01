import React, { useState, useRef, useEffect, Component } from 'react';
import './App.css';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMicrophone } from "@fortawesome/free-solid-svg-icons"
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons"
import config from './config'
const Audiochat = React.memo(function Audiochat(props) {
  let socket;//try
  let call;//try
  const roomid = "11435";
  try {
    socket = io(config.REACT_APP_AUDIO_SOCKET_URL);
  } catch (error) {
    //TODO:通信エラーをユーザーに知らせる
    console.log('通信エラー:', error);
  }
  let myPeer;
  const myVideo = document.createElement('video');
  myVideo.muted = true;
  const videoWeap = useRef([]);
  const peers = {}
  let myVideoStream
  const buttonRef = useRef(null);
  const buttonNoneRef = useState(null);
  const buttonText = useRef(null);
  const buttonTextAudio = useRef(null);
  //const [myVideoStream, setMyVideoStream] = useState(null);

  useEffect(() => {
    buttonNoneRef.current.classList.add('active_false');
    const connectToNewUser = (userId, stream) => {
      try {
        try {
          call = myPeer.call(userId, stream);
        } catch (error) {
          console.error('新しいピアとの接続エラー:', error);
          //TODO: ここにエラー発生時の処理を記述
        }
        const video = document.createElement('video');
        video.setAttribute('playsinline', 'true');
        call.on("stream", (userVideoStream) => {
          addVideoStresm(video, userVideoStream);
        });
        call.on("close", () => {
          video.remove();
        })
        try {
          peers[userId] = call;
        } catch (error) {
          console.error('新しいピアとの接続エラー:', error);
          // TODO:ここにエラー発生時の処理を記述
        }
      } catch (error) {
        console.error('新しいユーザーとの接続エラー:', error);
        // TODO:ここにエラー発生時の処理を記述
        setTimeout(() => {
          connectToNewUser(userId, stream);
        }, 5000); // 5秒後に再接続を試みる
      }
    }

    const addVideoStresm = (video, stream) => {
      video.setAttribute('playsinline', 'true'); // この行を追加
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      })
      videoWeap.current.appendChild(video);
    }

    myPeer = new window.Peer()
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    })
      .then((stream) => {
        if (stream && stream.active) {
        } else {
        }
        //setMyVideoStream(stream);
        myVideoStream = stream;
        addVideoStresm(myVideo, stream);
        muteUnmute();
        myPeer.on("call", (call) => {
          call.answer(stream);
          const video = document.createElement("video");
          call.on("stream", userVideoStream => {
            addVideoStresm(video, userVideoStream);
          })
          const userId = call.peer;
          peers[userId] = call;
        })

        socket.on("user-connected", (userId) => {
          connectToNewUser(userId, myVideoStream);
        })
      });

    myPeer.on("disconnected", (userId) => {
      try {
        // 切断時の処理
      } catch (error) {
        console.error('ピアの切断処理中のエラー:', error);
        // TODO:ここにエラー発生時の処理を記述
      }
    })
    myPeer.on("error", (err) => {
    });
    myPeer.on("open", userId => {
      socket.emit("join-room", roomid, userId);
    })

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    })

    //try
    socket.on("connect_error", (error) => {
      console.error('ソケット接続エラー:', error);
      setTimeout(() => {
        socket.connect();
      }, 5000); // 5秒後に再接続を試みる
    });
  }, []);

  const muteUnmute = (e) => {

    if (!myVideoStream || !myVideoStream.getAudioTracks() || myVideoStream.getAudioTracks().length === 0) {

      return;
    }
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      buttonRef.current.classList.add('active_false');
      buttonNoneRef.current.classList.remove('active_false');
      buttonNoneRef.current.classList.add('active');
      buttonText.current.innerText = 'ミュート中';
    } else {
      myVideoStream.getAudioTracks()[0].enabled = true;
      buttonRef.current.classList.remove('active_false');
      buttonRef.current.classList.add('active');
      buttonNoneRef.current.classList.add('active_false');
      buttonTextAudio.current.innerText = '通話中';
    }
  }

  const playStop = (e) => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false
      //e.classList.add("active")
      //myVideoStream.getVideoTracks()[0].enabled =  false
    } else {
      //e.classList.remove("active")
      myVideoStream.getVideoTracks()[0].enabled = true
    }
  }

  const leaveVideo = (e) => {
    socket.disconnect();
    myPeer.disconnect();
    myPeer = null;
    const videos = document.getElementsByTagName("video")
    for (let i = videos.length - 1; i >= 0; --i) {
      videos[i].remove();
    }
  }

  function redirectToExternalURL(url) {
    window.open(url, '_blank');
  }

  return (
    <div>
      <div className='social_area'>
        <div className='main__wrap'>
          <div className='video_controller'>
            <div>
              <div ref={buttonRef} className='btn__action' onClick={muteUnmute}><FontAwesomeIcon icon={faMicrophone} bounce className='icon' /><p ref={buttonTextAudio} className='text_mute_status'>通話中</p></div>
              <div ref={buttonNoneRef} className='btn__action' onClick={muteUnmute}><FontAwesomeIcon icon={faMicrophoneSlash} className='icon' /><p ref={buttonText} className='text_mute_status'>ミュート中</p></div><br></br>
            </div>
          </div>
        </div>
      </div>
      <div ref={videoWeap} className='hide'></div>
    </div>

  );
})

export default Audiochat
