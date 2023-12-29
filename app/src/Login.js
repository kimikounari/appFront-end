import React, { useState, useEffect } from 'react';
import './App.css';
import './App.css';
import axios from 'axios';
import config from './config'
import io from 'socket.io-client';
let socket;
const Login = ({ setLoginUserInfo }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [signupDisplay, setSignupDisplay] = useState(false);
    const [loginAreaDiaplay, setLoginAreaDisplay] = useState(true);
    const [loading, setLoading] = useState(false);
    const [serverResponeMessage, setServerResponseMessage] = useState('');
    const [avatar_number, setAvatarNum] = useState('1');
    const [userCount, setUserCount] = useState(0);
    const avatars = [
        '/DefaultAvatar.png',
        '/character_one.png'
    ];
    useEffect(() => {
        socket = io(config.REACT_APP_USER_COUNT_URL);

        socket.on('userCountUpdate', (count) => {
            setUserCount(count);
        });

        return () => {
            socket.disconnect();
        };

    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerResponseMessage('');
        try {
            const response = await axios.post(process.env.REACT_APP_SIGN_API_URL, {
                username: name,
                password: password,
                avatart_number: avatar_number
            });

            if (response.status === 201) {
                setServerResponseMessage('アカウントの作成に成功しました。');
            } else if (response.status === 400) {
                setServerResponseMessage('サーバーとの通信に失敗しました。');
            } else {
                setServerResponseMessage('サーバーとの通信に失敗しました。')
            }

        } catch (error) {
            setServerResponseMessage('このユーザー名は既に使われています。')
        }
        setName('');
        setPassword('');
        setLoading(false);
    };

    const handleRetrieve = async (e) => {
        setServerResponseMessage('');
        e.preventDefault();
        socket.emit('incrementUserCount');
        setLoading(true);
        try {
            axios.post(process.env.REACT_APP_TOKEN_API_URL, {
                username: name,
                password: loginPass
            })
                .then(response => {
                    // トークンを保存
                    const token = response.data.token;
                    // トークンを使用して認証済みリクエストを行う
                    axios.get(process.env.REACT_APP_LOGIN_API_URL_CER, {
                        headers: {
                            'Authorization': `Token ${token}`
                        }
                    })
                        .then(response => {
                            // 成功したリクエストの処理
                            localStorage.removeItem('myData');
                            // ローカルストレージに新しいデータを保存
                            localStorage.setItem('myData', JSON.stringify(response.data));
                            setLoginUserInfo(response.data);
                            setLoginAreaDisplay(prevState => !prevState);
                        })
                        .catch(error => {
                            // エラー処理
                            console.error(error);
                        });
                })
                .catch(error => {
                    // ログインエラー処理
                    console.error(error);
                    setServerResponseMessage('サーバーとの通信に失敗しました。');
                });
        } catch (error) {
            setServerResponseMessage('ユーザー名かパスワードが間違っています。');
        }
        setLoginPass('');
        setName('');
        setLoading(false);
    };

    function toggleSignupDisplay() {
        setSignupDisplay(prevState => !prevState);
        setServerResponseMessage('');
    }

    const logout = () => {
        setLoginUserInfo(null);
        setLoginAreaDisplay(true);
        setSignupDisplay(false);
    }

    return (
        <div>
            <div className={`${loading ? "communication-style" : "hide"}`}></div>
            <div className={`${loginAreaDiaplay ? "require-login-area" : "hide"}`}>
                <div className={`${signupDisplay ? "signup-area" : "hide"}`}>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="ニックネーム"
                            className='signup-text-input'
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワード"
                            className='signup-password-input'
                        />
                        <div className='avatar-select-area'>
                            <p>使用するアバターを選んでください。</p>
                            <div className='select-avatar-img-wrap'>
                                {avatars.map((avatar, index) => (
                                    <div>
                                        <img key={index} src={avatar} alt={`Avatar ${index + 1}`} className="select-avatar-img" />
                                        <small>{index + 1}のアバター</small>
                                    </div>
                                ))}
                            </div>
                            <select value={avatar_number} onChange={(e) => setAvatarNum(e.target.value)}>
                                <option value="1">1のアバターを使用</option>
                                <option value="2">2のアバターを使用</option>
                            </select>
                        </div>
                        <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                        <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                        <button type="submit" className='signup-button'>サインアップ</button>
                        <a href='#' onClick={toggleSignupDisplay} className='login-redirect-text'>ログイン</a>
                    </form>
                </div>
                <div className={`${signupDisplay ? "hide" : "login-area"}`}>
                    <form>
                        {userCount < 3 ? (
                            <>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="ユーザー名"
                                    className='login-text-input'
                                />
                                <input
                                    type="password"
                                    value={loginPass}
                                    onChange={(e) => setLoginPass(e.target.value)}
                                    placeholder="Password"
                                    className='login-password-input'
                                />
                                <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                                <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                                <button type="submit" className='login-button' onClick={handleRetrieve}>ログイン</button>
                            </>
                        ) : (
                            <p>現在二人のユーザーが同時アクセスしているので、ログインできません。しばらくお待ちください。</p>
                        )}
                        <a href="#" onClick={toggleSignupDisplay} className='signup-redirect-text'>アカウントを作成する</a>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login
