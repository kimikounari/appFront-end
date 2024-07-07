import React, { useState, useEffect, useRef } from 'react';
import './Login.css';
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
    const [lodoDisplay, setLogoDisplay] = useState(true);
    const [signupButtonHandle, setSignupButtonHandle] = useState(false);
    const [acceptButtonHandle, setAcceptButtonHandle] = useState(false);
    const [passwordShown, setPasswordShown] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [isCheckedTerms, setIsCheckedTerms] = useState(false)
    const avatars = [
        '/DefaultAvatar.png',
        '/character_one.png'
    ];

    const [buttonVisible, setButtonVisible] = useState(false);
    const termsRef = useRef(null);

    const handleScroll = () => {
        const termsElement = termsRef.current;
        if (termsElement) {
            const isBottom = termsElement.scrollHeight - termsElement.scrollTop === termsElement.clientHeight;
            if (isBottom) {
                setButtonVisible(true);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setServerResponseMessage('');
        setLogoDisplay(false);
        setLoginAreaDisplay(prevState => !prevState);
        try {
            const response = await axios.post('https://django-login-yggs.onrender.com/api/users/', {
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
        //setLoading(false);

    };

    const handleRetrieve = async (e) => {
        setServerResponseMessage('');
        e.preventDefault();
        //socket.emit('incrementUserCount');
        setLoading(true);

        try {
            axios.post('https://django-login-yggs.onrender.com/auth/', {
                username: name,
                password: loginPass
            })
                .then(response => {
                    // トークンを保存
                    const token = response.data.token;
                    // トークンを使用して認証済みリクエストを行う
                    axios.get('https://django-login-yggs.onrender.com/api/myself/', {
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
                            setLogoDisplay(false);
                        })
                        .catch(error => {
                            // エラー処理
                            console.error(error);
                            setLoginAreaDisplay(prevState => !prevState);
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
        if (acceptButtonHandle == false) {
            setAcceptButtonHandle(prevState => !prevState);
            setSignupButtonHandle(false)
        }
        setServerResponseMessage('');
        if (isCheckedTerms) {
            setIsCheckedTerms(false);
        }
    }

    const logout = () => {
        setLoginUserInfo(null);
        setLoginAreaDisplay(true);
        setSignupDisplay(false);
    }

    const toggleSignupButton = (e) => {
        e.preventDefault();
        setSignupButtonHandle(prevState => !prevState);
        setAcceptButtonHandle(prevState => !prevState);
    }

    const togglePasswordVisibility = (e) => {
        setIsChecked(e.target.checked);
        setPasswordShown(!passwordShown);
        //setLoading(prevState => !prevState)
    };

    const handleCheckboxChange = (event) => {
        setIsChecked(event.target.checked);
    };

    const handleCheckboxTerms = (event) => {
        setIsCheckedTerms(event.target.checked);
    }

    return (
        <div className='login-area-wrap'>
            <div className={`${lodoDisplay ? "token-area" : "hide"}`}>
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
                                type={passwordShown ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワード"
                                className='signup-password-input'
                            />
                            <div className='passwor-chackbox-wrap'>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onClick={togglePasswordVisibility}
                                    className='check-box'
                                />
                                <small className='passwor-chackbox-text'>{passwordShown ? 'パスワードを隠す' : 'パスワードを表示する'}</small>
                            </div>
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

                            <button type="submit" className="signup-button">アカウント作成</button>
                            <a href='#' onClick={toggleSignupDisplay} className='signup-redirect-text'>ログインする</a>

                        </form>

                    </div>

                    <div className={`${signupDisplay ? "hide" : "login-area"}`}>
                        <form>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ユーザー名"
                                className='login-text-input'
                            />
                            <input
                                type={passwordShown ? 'text' : 'password'}
                                value={loginPass}
                                onChange={(e) => setLoginPass(e.target.value)}
                                placeholder="Password"
                                className='login-password-input'
                            />
                            <div className='passwor-chackbox-wrap'>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onClick={togglePasswordVisibility}
                                    className='check-box'
                                />
                                <small className='passwor-chackbox-text'>{passwordShown ? 'パスワードを隠す' : 'パスワードを表示する'}</small>
                            </div>
                            <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                            <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                            <button type="submit" className='login-button' onClick={handleRetrieve}>ログイン</button>

                            <a href="#" onClick={toggleSignupDisplay} className='signup-redirect-text'>アカウントを作成する</a>
                        </form>
                    </div>
                </div>
            </div>

            <div className={`${loading ? "signup-success-wrap" : "hide"}`}>
                <p className="communication-message">{serverResponeMessage}</p>

                <form>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ユーザー名"
                        className='login-text-input'
                    />
                    <input
                        type={passwordShown ? 'text' : 'password'}
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        placeholder="Password"
                        className='login-password-input'
                    />
                    <div className='passwor-chackbox-wrap'>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onClick={togglePasswordVisibility}
                            className='check-box'
                        />
                        <small className='passwor-chackbox-text'>{passwordShown ? 'パスワードを隠す' : 'パスワードを表示する'}</small>
                    </div>
                    <button type="submit" className='login-button' onClick={handleRetrieve}>ログイン</button>
                </form>
            </div>
        </div>
    );
}

export default Login
