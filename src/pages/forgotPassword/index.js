import React, { useState } from 'react';
import './style.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; 

import Input from '../../components/ui/InputWhite/Input';

function ForgotPasswordPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 

    const handleSendCode = async (e) => {
        e.preventDefault();
        
        if (isLoading) return;

        if (!email) {
            alert('Por favor, digite seu e-mail.');
            return;
        }
        
        setIsLoading(true); 

        const payload = {
            educatorEmail: email
        };

        try {
            const API_URL = `${process.env.REACT_APP_API_BASE_URL}/educator/generate-token`;
            await axios.put(API_URL, payload);

            alert(`Um código de recuperação foi enviado para ${email}.`);
            setStep(2); 
        
        } catch (error) {
            console.error('Erro ao solicitar código:', error);
            if (error.response?.status === 404) {
                alert('Erro: E-mail não encontrado no sistema.');
            } else {
                alert('Erro ao solicitar o código. Tente novamente.');
            }
        } finally {
            setIsLoading(false); 
        }
    };

    const handlePasswordRecovery = (e) => {
        e.preventDefault();
        if (!code) {
            alert('Por favor, insira o código recebido.');
            return;
        }
        if (code.length >= 6) { 
            alert('Código inserido. Vamos para a tela de nova senha.');
            navigate('/resetPassword', { 
                state: { 
                    email: email, 
                    code: code 
                } 
            }); 
        } else {
            alert('Código inválido. Tente novamente.');
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

    const renderStep1 = () => (
        <>
            {renderLockIcon()}
            
            <h1 className="forgot-title">Problemas para logar?</h1>
            
            <p className="forgot-info">
                Insira o seu email e enviaremos um link para você voltar a acessar a sua conta.
            </p>
            
            <Input
                label="Email:"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading} 
            />

            <button 
                className="custom-button-forgot" 
                type="submit"
                disabled={isLoading} 
            >
                {isLoading ? 'Enviando...' : 'Receber código'}
            </button>
            
            <div className="separator-line"></div>
            <Link to="/register" className="create-account-link">
                Criar nova conta
            </Link>
        </>
    );

    const renderStep2 = () => (
        <>
            {renderLockIcon()}
            
            <h1 className="forgot-title">Insira o código recebido</h1>
            
            <Input
                label="" 
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="AED340G" 
            />

            <button className="custom-button-forgot" type="submit">
                Recuperar senha
            </button>
        </>
    );

    return (
        <div className="forgot-page-container">
            <div className="form-side">
                <div 
                    className={`forgot-form-container ${step === 2 ? 'smaller-container' : ''}`}
                >
                    
                    <form onSubmit={step === 1 ? handleSendCode : handlePasswordRecovery}>
                        
                        {step === 1 ? renderStep1() : renderStep2()}
                        
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage; 