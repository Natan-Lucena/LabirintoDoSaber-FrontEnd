import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios'; 

import Button from '../../components/ui/ButtonYellow/Button';

function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate(); 
    const location = useLocation(); 

   
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    
    useEffect(() => {
        if (location.state?.email && location.state?.code) {
           
            setEmail(location.state.email);
            setCode(location.state.code);
        } else {
           
            alert('Sessão inválida. Por favor, solicite um novo código.');
            navigate('/forgotPassword'); 
        }
    }, [location.state, navigate]); 

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        
        if (!password || !confirmPassword) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        
        const payload = {
            email: email,
            newPassword: password,
            code: code 
        };

        const API_URL = `${process.env.REACT_APP_API_BASE_URL}/educator/update-password`;

        try {
            
            await axios.post(API_URL, payload);

            alert('Senha redefinida com sucesso! Redirecionando para o login.');
            
            setPassword('');
            setConfirmPassword('');

            navigate('/'); 

        } catch (err) {
            
            console.error('Erro ao redefinir senha:', err);
            if (err.response?.status === 400 || err.response?.status === 401) {
                
                setError('O código de verificação está incorreto ou expirou. Por favor, solicite um novo.');
            } else {
                setError('Ocorreu um erro inesperado. Tente novamente.');
            }
        }
    };

  
    const renderLockIcon = () => (
        <div className="lock-icon-wrapper">
            <div className="lock-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="11" width="14" height="10" rx="1" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 8C7 5.23858 9.23858 3 12 3V3C14.7614 3 17 5.23858 17 8V11H7V8Z" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div> 
        </div>
    );

    return (
        <div className="reset-page-container">
            <div className="form-side">
                <div className="reset-form-container">
                    
                    <form onSubmit={handleResetPassword}>
                        
                        {renderLockIcon()}
                        
                        <h1 className="reset-title">Redefina a sua senha</h1>
                        
                        {error && <p className="error-message">{error}</p>}
                        
                        <div className="input-group">
                            <label className="input-label">Insira sua nova senha:</label>
                            <input
                                className="custom-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Confirme a sua nova senha:</label>
                            <input
                                className="custom-input"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <Button type="submit">
                            Redefinir senha
                        </Button>
                        
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;