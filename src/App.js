import React, { useState } from 'react';
import './App.css';
import NotePage from './components/NotePage';

function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleContinue = async () => {
    if (!showPassword) {
      setShowPassword(true);
    } else {
      try {
        const response = await fetch('http://localhost:5000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('username', data.user.name);
          setIsLoggedIn(true);
        } else {
          const errorData = await response.json();
          alert(errorData.error || '登录失败');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('登录时发生错误');
      }
    }
  };

  if (isLoggedIn) {
    return <NotePage username="Huan Gao" />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title" style={{textAlign: 'left'}}>心之所向，必有所得。</h1>
        <p className="login-subtitle" style={{textAlign: 'left'}}>登录你的 Finder帐号</p>

        <div className="login-buttons">
          <button className="login-button google-button">
            <img src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" alt="Google" />
            Google 登录
          </button>

          <button className="login-button apple-button">
            <img src="https://cdn.cdnlogo.com/logos/a/12/apple.svg" alt="Apple" />
            Apple 登录
          </button>

          <button className="login-button sso-button">
            <span className="sso-icon">⚡</span>
            单点登录 (SSO)
          </button>
        </div>

        <div className="email-section">
          <p className="email-label">邮件地址</p>
          <input 
            type="email" 
            className="email-input"
            placeholder="输入你的邮件地址..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={showPassword}
          />
          
          {showPassword && (
            <>
              <p className="email-label">密码</p>
              <input 
                type="password" 
                className="email-input"
                placeholder="输入你的密码..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="forgot-password">
                <a href="#" className="forgot-link">忘记密码？</a>
              </div>
            </>
          )}
          
          <button className="continue-button" onClick={handleContinue}>
            {showPassword ? '用密码登录' : '继续'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
