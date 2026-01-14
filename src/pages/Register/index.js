import React, { useState } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom"; // Importa o useNavigate
import axios from "axios"; // Importa o axios

import Button from "../../components/ui/ButtonYellow/Button";
import Input from "../../components/ui/InputWhite/Input";
import logo from "../../assets/images/logo.png";
import onda from "../../assets/images/ondaLogin.png";
import googleIcon from "../../assets/images/Google.png";

function RegisterPage() {
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!nomeCompleto || !email || !password || !confirmPassword) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não coincidem. Por favor, verifique.");
      return;
    }

    const payload = {
      name: nomeCompleto,
      email: email,
      password: password,
    };

        try {
            
            const API_URL = '${process.env.REACT_APP_API_BASE_URL}/educator/register';

            
            const response = await axios.post(API_URL, payload);

      console.log("Resposta da API:", response.data);

      setNomeCompleto("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Email já em uso ou dados inválidos.";
        alert(`Erro no cadastro: ${errorMessage}`);
      } else if (error.request) {
        alert("Erro de conexão. O servidor parece estar offline.");
      } else {
        alert(`Erro: ${error.message}`);
      }
    }
  };

  return (
    <div className="register-page-container">
      <div className="form-side">
        <div className="register-form-container">
          <form onSubmit={handleRegister}>
            <h1 className="register-title">Criar Conta</h1>

            <p className="sign-link">
              Já possui uma conta? <Link to="/">Login</Link>
            </p>

            <Input
              label="Nome Completo:"
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />

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

            <Input
              label="Confirmar Senha:"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit">Cadastrar-se</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
