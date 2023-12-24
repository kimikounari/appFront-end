import React, { useState, useRef, useEffect, Component } from 'react';
import './App.css';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import io from 'socket.io-client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMicrophone } from "@fortawesome/free-solid-svg-icons"
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons"
import config from './config'
const Audiochat = () => {
  const roomid = "11435";
  const socket = io(config.REACT_APP_AUDIO_SOCKET_URL);
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
      const call = myPeer.call(userId, stream);
      const video = document.createElement('video');
      call.on("stream", (userVideoStream) => {
        addVideoStresm(video, userVideoStream);
      });
      call.on("close", () => {
        video.remove();
      })
      peers[userId] = call;
    }

    const addVideoStresm = (video, stream) => {
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
    })
    myPeer.on("error", (err) => {
    });
    myPeer.on("open", userId => {
      socket.emit("join-room", roomid, userId);
    })

    socket.on("user-disconnected", (userId) => {
      if (peers[userId]) peers[userId].close();
    })

    //テスト
    socket.on("connect_error", (err) => {
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
}

export default Audiochat
