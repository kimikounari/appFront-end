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
                            <p className={`${loading ? "communication-message" : "hide"}`}>サーバーに通信中...</p>
                            <p className={`${serverResponeMessage ? "communication-message" : "hide"}`}>{serverResponeMessage}</p>
                            <div className="App">
                                <h3 className={acceptButtonHandle ? "" : 'hide'}>注意事項</h3>
                                <small className={acceptButtonHandle ? "careful-text" : 'hide'}>アプリを利用する上での注意事項です。スクロールして、「承諾する」ボタンを押すとアカウントが作成できます。</small>
                                <div className={acceptButtonHandle ? "terms-container" : 'hide'} onScroll={handleScroll} ref={termsRef}>
                                    {/* 利用規約のテキストをここに挿入 */}
                                    <p>1. 行動規範<br></br>
                                        適切な行動の期待： ユーザーに対して礼儀正しく、尊重のある行動を求めます。<br></br>
                                        ハラスメントやいじめの禁止： 他のユーザーに対する嫌がらせ、いじめ、脅迫的な行動は厳禁とします。<br></br>
                                        違法行為の禁止： 法律に違反する活動やコンテンツの共有を禁じます。<br></br>
                                        2. コンテンツのガイドライン<br></br>
                                        著作権の尊重： 著作権、商標権、その他の知的財産権を尊重して下さい。<br></br>
                                        不適切なコンテンツの禁止： グラフィック性、暴力的、または不適切なコンテンツのアップロードを禁止します。<br></br>
                                        ビデオ通話やチャットでは、個人情報となり得る内容の共有は避けてください。これには、住所、電話番号、金融情報などが含まれます。個人的な情報の保護とプライバシーの確保のため、これらのデータの共有は厳に慎んでください。<br></br>
                                        3. プライバシーとデータ保護<br></br>
                                        ユーザーのデータは、アプリを使う上で、下記の3つのことのために利用します。<br></br>
                                        １：使用するアバターの番号<br></br>
                                        ２：誰が、参加してるかを他のユーザーに知らせるため。<br></br>
                                        ３：誰とチャットやビデオ通話をしてるのかを他のユーザーに知らせるため。<br></br>
                                        <br></br>
                                        ユーザーのデータは、第３者に提供することはありません。<br></br>
                                        <br></br>
                                        ビデオ通話中に背景をぼかす機能は現在提供されていません。そのため、カメラに個人情報が映り込まないようご注意ください。ビデオで背景が映ることに懸念がある場合は、ビデオ機能をオフにするか、背景を調整することをお勧めします。<br></br>
                                        <br></br>
                                        4. 利用制限とアカウント終了<br></br>
                                        アカウントの停止や終了： 規約に違反する場合、アカウントが停止または終了される可能性があります。<br></br>
                                        <br></br>
                                        5. 免責事項<br></br>
                                        サービスの「現状有姿」の提供： サービスが「現状のまま」提供され、保証することはできません。<br></br>
                                        リスクの承認： ユーザーがサービスを利用することに伴うリスクを理解し、それを承認して下さい。<br></br>
                                        6:その他<br></br>
                                        本アプリの使用にはインターネット接続が必要です。アプリの使用によって発生するデータ通信料は、ユーザーの負担となります。データ通信料はユーザーのネットワークプロバイダの契約内容に依存しますので、ご利用前にプロバイダのプランをご確認ください。
                                        <br></br>
                                        本サービスに関連して生じるすべての紛争については、日本国法を適用し、日本の裁判所を専属的な管轄裁判所とします。
                                        <br></br>
                                        プロトタイプのアプリのため、エラーなどで正しく動作しない場合がありますが、ご了承ください。
                                        利用しているネットワーク状況や端末のOSやハードウェアの要件によりアプリの機能が動作しないことがあります。比較的新しいデバイスでの利用をおすすめしますが、動作の保証はできません。
                                    </p>
                                    <button className="accept-button" onClick={toggleSignupButton}>承諾する</button>
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
