import React, { useState } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode"; 

import Button from '../../components/ui/ButtonYellow/Button';
import Input from '../../components/ui/InputWhite/Input';
import logo from '../../assets/images/logo.png';
import onda from '../../assets/images/ondaLogin.png';
import googleIcon from '../../assets/images/Google.png';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Por favor, preencha o e-mail e a senha.');
      return;
    }

    const payload = {
      email: email,
      password: password
    };

    const API_URL = `${process.env.REACT_APP_API_BASE_URL}/educator/sign-in`;

    try {
      const response = await axios.post(API_URL, payload);
      
      const { token } = response.data;

      if (token) {
        localStorage.setItem('authToken', token);
        
  
        try {
            const decoded = jwtDecode(token);
            
           
            const userId = decoded.id; 

            if (userId) {
                console.log("ID do usuário salvo:", userId);
                localStorage.setItem('userId', userId);
            }

       

        } catch (decodeError) {
            console.error("Erro ao decodificar token:", decodeError);
        }

        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        alert('Login realizado com sucesso!');
        navigate('/home'); 
      } else {
        alert('Erro: Token não recebido do servidor.');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro no login: E-mail ou senha incorretos.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="form-side">
        <div className="login-form-container">
          <form onSubmit={handleLogin}>
            <h1 className="login-title">Login</h1>
            <p className="signup-link">
              Não tem uma conta?{' '}
              <Link to="/register">Criar conta</Link>
            </p>
            <Input
              label="Email:"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Senha:"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="options-row">
              <div className="checkbox-group">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Se lembre de mim</label>
              </div>
              <Link to="/forgotPassword" className="forgot-password">Esqueceu a senha?</Link>
            </div>
      
            <Button type="submit">
              Entrar
            </Button>
          </form> 
       
          <div className="divider">
            <span>Ou continue com</span>
          </div>

          <button className="google-button">
            <img src={googleIcon} alt="Google logo" className="google-logo" />
          </button>

        </div>
      </div>

      <div className="branding-side" style={{ backgroundImage: `url(${onda})` }}>
        <img src={logo} alt="Labirinto do Saber Logo" className="logo-image" />
      </div>

    </div>
  );
}

export default LoginPage;