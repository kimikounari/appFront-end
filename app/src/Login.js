import React, { useState } from 'react';
import './App.css';
import './App.css';
import axios from 'axios';

const Login = ({ setLoginUserInfo }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [signupDisplay, setSignupDisplay] = useState(false);
    const [loginAreaDiaplay, setLoginAreaDisplay] = useState(true);
    const [loading, setLoading] = useState(false);
    const [serverResponeMessage, setServerResponseMessage] = useState('');
    const [avatar_number, setAvatarNum] = useState('1');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerResponseMessage('');
        try {
            //本番用コード
            //const response = await axios.post('https://django-login-yggs.onrender.com/api/custom-model/', {

            //開発用コード
            const response = await axios.post('http://127.0.0.1:8080/api/custom-model/', {
                name: name,
                _password: password,
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
        setLoading(true);
        try {
            //本番用コード
            //const response = await axios.post('https://django-login-yggs.onrender.com/api/get-name-and-id/', {

            //開発用コード
            const response = await axios.post('http://127.0.0.1:8080/api/get-name-and-id/', {
                _password: loginPass,
                name: name
            });

            if (response.status === 200) {
                const data = response.data;
                console.log(data);
                setLoginUserInfo(data);
                setLoginAreaDisplay(prevState => !prevState);
            } else {
                setServerResponseMessage('サーバーとの接続に失敗しました。');
            }
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
                        <p>使用するアバター</p>
                        <select value={avatar_number} onChange={(e) => setAvatarNum(e.target.value)}>
                            <option value="1">1のアバターを使用</option>
                            <option value="2">2のアバターを使用</option>
                        </select>
                        <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                        <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                        <button type="submit" className='signup-button'>サインアップ</button>
                        <a href='#' onClick={toggleSignupDisplay} className='login-redirect-text'>ログイン</a>
                    </form>
                </div>
                <div className={`${signupDisplay ? "hide" : "login-area"}`}>
                    <form onSubmit={handleRetrieve}>
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
                        <button type="submit" className='login-button'>ログイン</button>
                        <a href="#" onClick={toggleSignupDisplay} className='signup-redirect-text'>アカウントを作成する</a>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login
