import React, { useState, useRef, useEffect } from 'react';
import './VideoChat.css';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from "@fortawesome/free-solid-svg-icons"
import { faVideoSlash } from "@fortawesome/free-solid-svg-icons"
import config from './config'
import { faMicrophone } from "@fortawesome/free-solid-svg-icons"
import { faMicrophoneSlash } from "@fortawesome/free-solid-svg-icons"
import Peer from 'peerjs';

const VideoChat = (props) => {
    const roomid = "56564";
    const socket = io('https://trial-app-comu.onrender.com/video_chat_socket');
    let myPeer;
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    const videoWeap = useRef([]);
    const peers = {}
    let myVideoStream
    //ミュートボタン管理
    const videoButtonRef = useRef(null);
    const videoButtonNoneRef = useState(null);
    const networkRef = useState(null);
    const videoText = useRef(null);
    const buttonTextVideo = useRef(null);
    const videoUserName = useRef([]);
    const buttonRef = useRef(null);
    const buttonNoneRef = useState(null);
    const buttonText = useRef(null);
    const buttonTextAudio = useRef(null);
    let userId
    let stream
    let call;
    // 接続エラーのリスナーを追加
    socket.on('connect_error', (error) => {
        console.error('Socket.IO接続エラー:', error);
        networkRef.current.classList.add('network-error-area');
        networkRef.current.classList.remove('hide');
        setTimeout(() => {
            socket.connect();
        }, 5000); // 5秒後
    });

    // 通信エラーのリスナーを追加（必要に応じて）
    socket.on('error', (error) => {
        console.error('Socket.IO通信エラー:', error);
        networkRef.current.classList.add('network-error-area');
        networkRef.current.classList.remove('hide');
    });

    useEffect(() => {
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
                networkRef.current.classList.add('network-error-area');
                networkRef.current.classList.remove('hide');
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
            myPeer = new Peer({
                config: {
                    //iceServers: [
                    //{ urls: 'stun:stun.l.google.com:19302' }
                    //]
                    iceServers: [{
                        urls: ["stun:ntk-turn-2.xirsys.com"]
                    }, {
                        username: "m557bDU3Benap-5d7xCv06usKdqxOnj3fftLNnlo3wBeXOFabXtRclzQabg9uT-YAAAAAGYJGThLaW1peWFzdQ==",
                        credential: "66824fbc-ef35-11ee-8b68-0242ac120004",
                        urls: [
                            "turn:ntk-turn-2.xirsys.com:80?transport=udp",
                            "turn:ntk-turn-2.xirsys.com:3478?transport=udp",
                            "turn:ntk-turn-2.xirsys.com:80?transport=tcp",
                            "turn:ntk-turn-2.xirsys.com:3478?transport=tcp",
                            "turns:ntk-turn-2.xirsys.com:443?transport=tcp",
                            "turns:ntk-turn-2.xirsys.com:5349?transport=tcp"
                        ]
                    }]
                }
            });

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                })

                myVideoStream = stream;
                addVideoStresm(myVideo, stream);
                muteUnmute();
                videomanager();
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
                networkRef.current.classList.add('network-error-area');
                networkRef.current.classList.remove('hide');
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
        functionVideoChat();
    }, [])

    const leaveVideo = (e) => {
        if (myVideoStream) {
            myVideoStream.getTracks().forEach(track => track.stop());
        }

        // 保存されているピアコネクションを閉じ、参照を削除
        Object.keys(peers).forEach((userId) => {
            if (peers[userId]) {
                peers[userId].close();
                delete peers[userId];
            }
        });

        if (myPeer) {
            myPeer.destroy();
            myPeer = null;
        }
        socket.disconnect();
        //myPeer.disconnect();
        //myPeer = null;
        const videos = document.getElementsByTagName("video")
        for (let i = videos.length - 1; i >= 0; --i) {
            videos[i].remove();
        }

        window.location.reload();
    }

    const videomanager = (e) => {

        if (!myVideoStream || !myVideoStream.getVideoTracks() || myVideoStream.getVideoTracks().length === 0) {

            return;
        }
        const enabled = myVideoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            myVideoStream.getVideoTracks()[0].enabled = false;
            videoButtonRef.current.classList.add('active_false');
            videoButtonNoneRef.current.classList.remove('active_false');
            videoButtonNoneRef.current.classList.add('active');
            videoText.current.innerText = 'ビデオオン';
        } else {
            myVideoStream.getVideoTracks()[0].enabled = true;
            videoButtonRef.current.classList.remove('active_false');
            videoButtonRef.current.classList.add('active');
            videoButtonNoneRef.current.classList.add('active_false');
            buttonTextVideo.current.innerText = 'ビデオオフ';
        }
    }

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

    const networkErrorHide = (e) => {
        networkRef.current.classList.add('hide');
        networkRef.current.classList.remove('network-error-area');
    }

    return (
        <div className='video-chat-area'>
            <div className='video-contoroll-area'>
                <div ref={videoButtonRef} className='btn__action' onClick={videomanager}><FontAwesomeIcon icon={faVideo} bounce className='icon' /><p ref={buttonTextVideo} className='text_mute_status'>カメラオン</p></div>
                <div ref={videoButtonNoneRef} className='btn__action' onClick={videomanager}><FontAwesomeIcon icon={faVideoSlash} className='icon' /><p ref={videoText} className='text_mute_status'>カメラオフ</p></div>
                <div ref={buttonRef} className='btn__action' onClick={muteUnmute}><FontAwesomeIcon icon={faMicrophone} bounce className='icon' /><p ref={buttonTextAudio} className='text_mute_status'>通話中</p></div>
                <div ref={buttonNoneRef} className='btn__action' onClick={muteUnmute}><FontAwesomeIcon icon={faMicrophoneSlash} className='icon' /><p ref={buttonText} className='text_mute_status'>ミュート中</p></div><br></br>
            </div>
            <div className='video-chat-wrap'>
                <div ref={videoUserName} className='video-user-name'></div>
                <div ref={videoWeap} className='video-wrap'></div>
            </div>

            <div ref={networkRef} className='hide'>
                <p>通信エラーが発生しました。</p>
                <button onClick={networkErrorHide}>OK</button>
            </div>

            <div className='quit-area'>
                {/* 切断ボタンの追加 */}
                <button onClick={leaveVideo} className='quite-btn'>退出</button>
            </div>
        </div>
    )
}
export default VideoChat
