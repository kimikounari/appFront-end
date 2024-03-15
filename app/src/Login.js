import React, { useState, useEffect, useRef } from 'react';
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
        setLogoDisplay(false);
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
                <div className='careful-area'>
                    <h3>[このアプリと現在の段階について]</h3>
                    <p>
                        このアプリは孤独感を解消し、コミュニケーションの練習ができることを目的に開発中です。現在は予算とサーバーリソースの制限で試作段階にあり、ログインやチャット、音声・ビデオ通話の機能で遅延が生じます。今後はVR導入やサーバーの強化、機能改善を計画しています。3D制作やプログラミングが好きな方々と取り組めたら幸いです。
                        <p>連絡先：2301100228qq@cyber-u.ac.jp</p>
                        <p>試作中のアプリを試す場合は、サーバーのリソースがテスト向けで、運用向けではないことをご理解ください。また、音声通話、ビデオ通話において、お使いのネットワークによって、機能しないことがある点もご理解ください。面白半分でお願いします。</p>
                    </p>
                </div>
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
                            <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                            <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                            <div className="App">
                                <small className={acceptButtonHandle ? "careful-text" : 'hide'}>アプリを利用するにあたっての「お願い」です。同意ボタンを押すと、単純なアカウントが作成できます。</small>
                                <div className={acceptButtonHandle ? "terms-container" : 'hide'} onScroll={handleScroll} ref={termsRef}>
                                    {/* 利用規約のテキストをここに挿入 */}

                                    <h3>利用にあたってのお願い</h3>
                                    <h4>コミュニティの健全性への配慮</h4>
                                    <p>「アプリ内で、他のユーザーや開発者に対して尊重と配慮を持って行動してください。攻撃的な発言や嫌がらせ、不適切なコンテンツの投稿は、コミュニティの健全性を損ないますのでお控えください。」</p>
                                    <h4>プライバシーとセキュリティへの配慮</h4>
                                    <p> 「アプリや関連するシステムのセキュリティや他のユーザーのプライバシーを守るために、不正なアクセスやハッキング行為、個人情報の不正利用は絶対におやめください。」</p>
                                    <h4>営利目的や不正行為の禁止</h4>
                                    <p>「アプリは、皆さんが楽しんで利用できるように提供されています。営利目的や不正な行為は避けてください。」</p>
                                    <h4>共有の質と量の配慮</h4>
                                    <p> 「スパム行為や不適切な広告の投稿は、コミュニティ全体の体験を損なう可能性があります。コンテンツの適切な共有と質の向上にご協力ください。」</p>
                                    <h4>著作権や知的財産権の尊重</h4>
                                    <p>「他のユーザーの著作権や知的財産権を尊重し、正当な権利を侵害しないようにしてください。コンテンツの共有や使用には、適切な権利を確認してください。」</p>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isCheckedTerms}
                                            onChange={handleCheckboxTerms}
                                        />
                                        上記のお願いを読んで、理解した。
                                    </label>
                                    <button className="accept-button" onClick={toggleSignupButton} disabled={!isCheckedTerms}>同意する</button>
                                    {/* 長いテキストを挿入してスクロールをテスト */}
                                </div>

                            </div>
                            <button type="submit" className={signupButtonHandle ? 'signup-button' : 'hide'}>アカウント作成</button>
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
                                </>
                            ) : (
                                <p>現在二人のユーザーが同時アクセスしているので、ログインできません。しばらくお待ちください。</p>
                            )}
                            <a href="#" onClick={toggleSignupDisplay} className='signup-redirect-text'>アカウントを作成する</a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login
