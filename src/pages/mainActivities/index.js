import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import iconCaderno from "../../assets/images/caderneta.png";
import iconSeta from "../../assets/images/seta_icon.png";
import { useNavigate } from "react-router-dom";
import PageTurner from "../../components/ui/PageTurner/index.js";

function AlunosPage() {
  const navigate = useNavigate();

  // Estados para dados e paginação
  const [notebooks, setNotebooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Estados dos menus dropdown
  const [isCriarOpen, setIsCriarOpen] = useState(false);
  const [isGerenciarOpen, setIsGerenciarOpen] = useState(false);

  // --- INTEGRAÇÃO COM BACKEND ---
  useEffect(() => {
    const fetchNotebooks = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        navigate("/");
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      try {
        const response = await axios.get(
          "https://labirinto-do-saber.vercel.app/task-notebook/",
          config
        );
        // O backend retorna um array de objetos { notebook: {...}, taskGroups: [...] }
        setNotebooks(response.data);
      } catch (error) {
        console.error("Erro ao buscar cadernos:", error);
        // Opcional: Tratar erro 401 (token expirado) redirecionando para login
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      }
    };

    fetchNotebooks();
  }, [navigate]);

  // --- LÓGICA DE PAGINAÇÃO ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotebooks = notebooks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(notebooks.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);

  // --- NAVEGAÇÃO E MENUS ---
  const handleAlunoClick = (notebookId) => {
    // CORREÇÃO AQUI:
    // 1. A rota deve ser '/NotebookDetails'
    // 2. A chave do objeto deve ser 'notebookId' (para bater com o código da outra página)
    navigate("/NotebookDetails", { state: { notebookId: notebookId } });
  };

  const handleNavigate = (path) => {
    setIsCriarOpen(false);
    setIsGerenciarOpen(false);
    navigate(path);
  };

  const toggleCriar = () => {
    setIsCriarOpen(!isCriarOpen);
    setIsGerenciarOpen(false);
  };

  const toggleGerenciar = () => {
    setIsGerenciarOpen(!isGerenciarOpen);
    setIsCriarOpen(false);
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="alunos-main-content">
        <div className="alunos-container">
          <div className="top-container-head">
            <h1>Atividades</h1>
            <div className="bnts-top">
              {/* Botão CRIAR */}
              <div className="button-and-subtitle-wrapper">
                <div
                  className={`dropdown-button-container ${
                    isCriarOpen ? "active" : ""
                  }`}
                >
                  <div
                    className="create-caderno dropdown-toggle"
                    onClick={toggleCriar}
                  >
                    <span>Criar</span>
                    <svg
                      width="13"
                      height="8"
                      viewBox="0 0 13 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-arrow"
                    >
                      <path
                        d="M0.5 0.5L6.5 6.5L12.5 0.5"
                        stroke="black"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {isCriarOpen && (
                    <div className="dropdown-menu">
                      <a onClick={() => handleNavigate("/addNotebook")}>
                        Criar caderno
                      </a>
                      <a onClick={() => handleNavigate("/GroupActivities")}>
                        Criar grupo de atividades
                      </a>
                      <a onClick={() => handleNavigate("/CreateNewActivitie")}>
                        Criar atividade
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão GERENCIAR */}
              <div className="button-and-subtitle-wrapper">
                <div
                  className={`dropdown-button-container ${
                    isGerenciarOpen ? "active" : ""
                  }`}
                >
                  <div
                    className="create-caderno dropdown-toggle"
                    onClick={toggleGerenciar}
                  >
                    <span>Gerenciar</span>
                    <svg
                      width="13"
                      height="8"
                      viewBox="0 0 13 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="dropdown-arrow"
                    >
                      <path
                        d="M0.5 0.5L6.5 6.5L12.5 0.5"
                        stroke="black"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {isGerenciarOpen && (
                    <div className="dropdown-menu">
                      <a onClick={() => handleNavigate("/ManageNotebook")}>
                        Gerenciar cadernos
                      </a>
                      <a onClick={() => handleNavigate("/ManageGroup")}>
                        Gerenciar grupo de atividades
                      </a>
                      <a onClick={() => handleNavigate("/ManageActivities")}>
                        Gerenciar atividades
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LISTA DE CADERNOS DINÂMICA */}
          <div className="student-card-list">
            {currentNotebooks.length > 0 ? (
              currentNotebooks.map((item) => (
                <div
                  key={item.notebook.id}
                  className="student-list-item-card"
                  onClick={() => handleAlunoClick(item.notebook.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={iconCaderno}
                    alt="Avatar"
                    className="caderno-avatar"
                  />
                  <div className="student-card-info">
                    {/* Título do Caderno */}
                    <h3>{item.notebook.description || "Caderno sem título"}</h3>

                    {/* Descrição baseada nos grupos ou texto fixo se preferir */}
                    <p>
                      {item.taskGroups.length > 0
                        ? `${item.taskGroups.length} grupo(s) de atividades.`
                        : "Nenhum grupo de atividades vinculado."}
                    </p>

                    {/* Categoria como botão */}
                    <button className="bnt-details">
                      {item.notebook.category
                        ? (() => {
                            if (item.notebook.category === "reading")
                              return "Leitura";
                            if (item.notebook.category === "writing")
                              return "Escrita";
                            if (item.notebook.category === "vocabulary")
                              return "Vocabulário";
                            if (item.notebook.category === "comprehension")
                              return "Compreensão";
                            return item.notebook.category;
                          })()
                        : "Geral"}
                    </button>
                  </div>

                  <div className="back-arrow">
                    <img src={iconSeta} alt="seta" className="seta-main" />
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  width: "100%",
                  marginTop: "20px",
                }}
              >
                Carregando...
              </p>
            )}
          </div>
          <PageTurner
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      </main>
    </div>
  );
}

export default AlunosPage;
