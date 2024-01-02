import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import './App.css';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from "@fortawesome/free-solid-svg-icons"
import config from './config'
const VideoChat = (props) => {
    const roomid = "56564";
    const socket = io(config.REACT_APP_VIDEO_SOCKET_URL);
    let myPeer;
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    const videoWeap = useRef([]);
    const peers = {}
    let myVideoStream
    //ミュートボタン管理
    const buttonRef = useRef(null);
    const buttonNoneRef = useState(null);
    const buttonText = useRef(null);
    const buttonTextAudio = useRef(null);
    const videoUserName = useRef([]);
    let userId
    let stream
    let call;
    // 接続エラーのリスナーを追加
    socket.on('connect_error', (error) => {
        console.error('Socket.IO接続エラー:', error);
        // TODO: エラーメッセージを表示するためのUIの更新など
        setTimeout(() => {
            socket.connect();
        }, 5000); // 5秒後
    });

    // 通信エラーのリスナーを追加（必要に応じて）
    socket.on('error', (error) => {
        console.error('Socket.IO通信エラー:', error);
        // TODO: エラーメッセージを表示するためのUIの更新など
    });

    const connectToNewUser = (userId, stream) => {
        try {
            try {
                call = myPeer.call(userId, stream);
            } catch (error) {
                console.log('P2P接続のエラー');
            }
            const video = document.createElement('video');
            video.setAttribute('playsinline', 'true');
            call.on("stream", (userVideoStream) => {
                addVideoStresm(video, userVideoStream);
            });
            call.on("close", () => {
                video.remove();
            })

            // エラーハンドリングを追加
            call.on("error", (err) => {
                console.error("Error occurred during call:", err);
            });
            const conn = myPeer.connect(userId);
            conn.on('open', () => {
                // データコネクションが開いたらユーザー名を送信
                conn.send({ type: 'username', username: props.loginUserName });
            });
            conn.on('data', (data) => {
                let partnerUserId = data.userId.toString();
                let partnerUserIdRemoveHyphen = "user" + partnerUserId.replace(/-/g, '');
                const span = document.createElement('span');
                span.textContent = data.username;
                span.classList.add(partnerUserIdRemoveHyphen);
                videoUserName.current.appendChild(span);
            });
            peers[userId] = call;
        } catch (erro) {
            console.error('P2P通信の接続エラー:', erro);
            //TODO:エラーメッセージの表示やその他のエラー処理
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

    const functionVideoChat = async () => {
        const span = document.createElement('span');
        span.textContent = props.loginUserName;
        videoUserName.current.appendChild(span);
        myPeer = new window.Peer()

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            })

            myVideoStream = stream;
            addVideoStresm(myVideo, stream);
            myPeer.on("call", (call) => {
                call.answer(stream);
                const video = document.createElement("video");
                call.on("stream", userVideoStream => {
                    addVideoStresm(video, userVideoStream);
                })
                call.on("close", () => {
                    video.remove();
                })
                userId = call.peer;
                peers[userId] = call;
            })

            socket.on("user-connected", (userId) => {
                connectToNewUser(userId, myVideoStream);
            })
        } catch (error) {
            console.error('メディアデバイスアクセスエラー:', error);
            //TODO:エラーメッセージを表示するためのUIの更新など
            setTimeout(() => {
                connectToNewUser(userId, stream);
            }, 5000); // 5秒後に再接続を試みる
        }

        myPeer.on("disconnected", (userId) => {
        })

        myPeer.on("open", userId => {
            socket.emit("join-room", roomid, userId);
        })

        myPeer.on('connection', conn => {
            const peerId = conn.peer;
            conn.on('data', (data) => {
                let partnerUserId = peerId.toString();
                let partnerUserIdRemoveHyphen = "user" + partnerUserId.replace(/-/g, '');
                const span = document.createElement('span');
                span.textContent = data.username;
                span.classList.add(partnerUserIdRemoveHyphen);
                videoUserName.current.appendChild(span);
                conn.send({ type: 'username', username: props.loginUserName, userId: myPeer.id });
            });
        });

        socket.on("user-disconnected", (userId) => {
            if (peers[userId]) {
                let disconnectedUserId = userId.toString();
                let partnerUserIdRemoveHyphen = "user" + disconnectedUserId.replace(/-/g, '');
                const spanToDelete = videoUserName.current.querySelector(`.${partnerUserIdRemoveHyphen}`);
                if (spanToDelete) {
                    spanToDelete.remove();
                }
                peers[userId].close();
            }
        })
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


    return (
        <div>
            <div onClick={functionVideoChat} className='video-chat-start-btn'><FontAwesomeIcon icon={faVideo} className='video-start-icon' /><small className='video-chat-start-text'>ビデオ開始</small></div>
            <div className='video-chat-wrap'>
                <div ref={videoUserName} id='video-user-name'></div>
                <div ref={videoWeap} id='video-wrap'></div>
            </div>
        </div>
    )
}

export default VideoChat
