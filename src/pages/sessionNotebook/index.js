import React, { useState, useEffect } from "react";
import "./style.css";
import axios from "axios";
import logo from "../../assets/images/logo.png";
import iconNotification from "../../assets/images/icon_notification.png";
import iconProfile from "../../assets/images/icon_profile.png";
import iconArrowLeft from "../../assets/images/seta_icon_esquerda.png";
import iconCard from "../../assets/images/caderneta.png";
import SearchBar from "../../components/ui/SearchBar/Search";
import { useNavigate, useLocation } from "react-router-dom"; 
import Navbar from "../../components/ui/NavBar/index.js";
// --- ÍCONES (Mantidos iguais) ---
const PlusIcon = () => (
    <svg width="25" height="25" viewBox="0 0 65 69" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_398_2393)">
            <path d="M46.0418 32.5003H18.9585" stroke="black" strokeLinecap="round"/>
            <path d="M32.4998 46.0413V18.958" stroke="black" strokeLinecap="round"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M32.4998 59.5837C47.4575 59.5837 59.5832 47.458 59.5832 32.5003C59.5832 17.5426 47.4575 5.41699 32.4998 5.41699C17.5421 5.41699 5.4165 17.5426 5.4165 32.5003C5.4165 47.458 17.5421 59.5837 32.4998 59.5837Z" stroke="black"/>
        </g>
        <defs>
            <filter id="filter0_d_398_2393" x="-4" y="0" width="73" height="73" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset dy="4"/>
                <feGaussianBlur stdDeviation="2"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_398_2393"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_398_2393" result="shape"/>
            </filter>
        </defs>
    </svg>
);

const CheckIcon = () => (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function SessionNotebookPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. RECUPERANDO DADOS DO FLUXO
    const { studentId, sessionName } = location.state || {};

    // Estados
    const [notebooks, setNotebooks] = useState([]);
    const [allTasks, setAllTasks] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false); 
    
    // Seleção
    const [selectedNotebook, setSelectedNotebook] = useState(null);

    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const categoryMap = {
        reading: "Vocabulário & Leitura",
        writing: "Escrita",
        vocabulary: "Vocabulário",
        comprehension: "Compreensão, Leitura & Vocabulário",
        general: "Geral"
    };

    // Segurança
    useEffect(() => {
        if (!studentId || !sessionName) {
            console.warn("Dados da sessão perdidos (studentId/sessionName).");
        }
    }, [studentId, sessionName]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) { navigate('/'); return; }
                
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Busca Cadernos e Tarefas
                const [notebooksResponse, tasksResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/task-notebook/`, config),
                    axios.get(`${process.env.REACT_APP_API_BASE_URL}/task/`, config)
                ]);
                
                // Mapeamento correto inspirado no seu NotebookDetailsPage
                const formattedNotebooks = notebooksResponse.data.map(item => {
                    // O objeto real do caderno pode estar em 'item.notebook' ou ser o próprio 'item'
                    const coreData = item.notebook ? item.notebook : item;
                    
                    return {
                        id: coreData.id || coreData._id,
                        name: coreData.description || coreData.name || "Caderno sem nome",
                        category: coreData.category || "general",
                        
                        // IMPORTANTE: Trazemos os dados crus para processar no Start
                        // Se tiver taskGroups (vindo da raiz do item), guardamos.
                        // Se tiver tasksIds (vindo do coreData), guardamos.
                        taskGroups: item.taskGroups || [], 
                        tasksIds: coreData.tasksIds || coreData.tasks || [],
                        
                        originalData: item 
                    };
                });

                setNotebooks(formattedNotebooks);

                if (Array.isArray(tasksResponse.data)) {
                    setAllTasks(tasksResponse.data);
                }

                setLoading(false);

            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleNotebookSelection = (notebook) => {
        if (selectedNotebook && selectedNotebook.id === notebook.id) {
            setSelectedNotebook(null);
        } else {
            setSelectedNotebook(notebook);
        }
    };

    // --- START SESSION (A CORREÇÃO ESTÁ AQUI) ---
    const handleStartSession = async () => {
        if (!selectedNotebook) {
            alert("Por favor, selecione um caderno.");
            return;
        }

        if (!studentId) {
            alert("Erro: Dados do aluno perdidos. Reinicie o fluxo.");
            return;
        }

        setIsStarting(true);

        // 1. EXTRAÇÃO INTELIGENTE DAS TAREFAS
        // Verificamos se o caderno tem GRUPOS ou TAREFAS DIRETAS
        let targetTasksIds = [];

        if (selectedNotebook.taskGroups && selectedNotebook.taskGroups.length > 0) {
            // CASO 1: O caderno é feito de grupos.
            // Precisamos pegar todas as tarefas de todos os grupos e juntar numa lista só.
            console.log("Caderno com Grupos detectado.");
            selectedNotebook.taskGroups.forEach(group => {
                if (group.tasksIds && Array.isArray(group.tasksIds)) {
                    targetTasksIds = [...targetTasksIds, ...group.tasksIds];
                }
            });
        } else {
            // CASO 2: O caderno tem tarefas diretas.
            console.log("Caderno com Tarefas Diretas detectado.");
            targetTasksIds = selectedNotebook.tasksIds || [];
        }

        if (targetTasksIds.length === 0) {
            alert("Este caderno está vazio (não contém grupos com atividades nem atividades soltas).");
            setIsStarting(false);
            return;
        }

        // 2. RESOLUÇÃO (IDs -> Objetos)
        const resolvedTasks = targetTasksIds.map(item => {
            // Busca a tarefa completa na lista global
            const originalTask = typeof item === 'object' 
                ? item 
                : allTasks.find(t => t.id === item || t._id === item);

            if (!originalTask) return undefined;

            return {
                ...originalTask,
                // Normaliza ID e Alternativas para o SessionInit não travar
                id: originalTask._id || originalTask.id, 
                alternatives: (originalTask.alternatives || originalTask.options || []).map((opt, index) => ({
                    ...opt,
                    id: opt._id || opt.id || String(index), 
                    text: opt.text || opt.label || "Opção"
                }))
            };
        }).filter(task => task !== undefined);

        if (resolvedTasks.length === 0) {
            alert("Erro: Não foi possível carregar os detalhes das atividades.");
            setIsStarting(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                studentId: studentId,
                name: sessionName,
                notebookId: selectedNotebook.id
            };

            console.log("Iniciando sessão de CADERNO:", payload);

            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/task-notebook-session/start`, 
                payload, 
                config
            );

            const sessionId = response.data.sessionId || response.data.id;

            // Envia o array 'resolvedTasks' que montamos a partir dos grupos/tarefas
            navigate(`/sessionInit`, { 
                state: { 
                    sessionId: sessionId,
                    studentId: studentId,
                    itemType: 'notebook',
                    groupName: selectedNotebook.name,
                    tasks: resolvedTasks 
                } 
            });

        } catch (error) {
            console.error("Erro ao iniciar sessão:", error);
            alert("Não foi possível iniciar a sessão. Verifique a conexão.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleFilterAction = () => {
        console.log("Abrir Filtro");
    };

    const filteredNotebooks = notebooks.filter((notebook) => 
        notebook.name && notebook.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredNotebooks.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredNotebooks.length / itemsPerPage);

    const paginate = (e, pageNumber) => {
        e.preventDefault();
        setCurrentPage(pageNumber);
    };

    return (
        <div className="dashboard-container">
            <Navbar activePage="activities" />

            <main className="session-notebook-select-main-content">
                <div className="session-notebook-select-container">
                        <a href="/sessionType" className="back-arrow-link">
                            <img src={iconArrowLeft} alt="Voltar" className="back-arrow-icon"/>
                        </a>
                    <div className="top-container">
                        <h1>Selecione o caderno desejado</h1>
                        
                        <div className="search-filter-group" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <SearchBar 
                                searchTerm={searchTerm}
                                setSearchTerm={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Buscar caderno..." 
                                onFilterClick={handleFilterAction}
                            />

                            <button 
                                onClick={handleStartSession}
                                disabled={!selectedNotebook || isStarting}
                                style={{
                                    backgroundColor: selectedNotebook ? '#81C784' : '#E0E0E0', 
                                    color: selectedNotebook ? '#FFF' : '#9E9E9E',
                                    border: 'none',
                                    padding: '0 25px',
                                    height: '52px', 
                                    borderRadius: '30px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: (selectedNotebook && !isStarting) ? 'pointer' : 'not-allowed',
                                    boxShadow: selectedNotebook ? '0px 4px 6px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {isStarting ? "Iniciando..." : "Iniciar Sessão"}
                            </button>
                        </div>
                    </div>
                    
                    <div className="session-notebook-select-card-list">
                        {loading ? (
                            <p style={{ textAlign: "center", color: "#666" }}>Carregando cadernos...</p>
                        ) : (
                            currentItems.length > 0 ? (
                                currentItems.map((notebook) => {
                                    const isSelected = selectedNotebook && selectedNotebook.id === notebook.id;

                                    return (
                                        <div className="notebook-select-row-wrapper" key={notebook.id}>
                                            <div
                                                className="notebook-select-list-item-card"
                                                style={{ 
                                                    cursor: "pointer",
                                                    border: isSelected ? "2px solid #81C784" : "2px solid transparent",
                                                    backgroundColor: isSelected ? "#F1F8E9" : "#FFF",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onClick={() => handleNotebookSelection(notebook)} 
                                            >
                                                <img src={iconCard} alt="Icone Caderno" className="notebook-select-card-icon" />
                                                <div className="notebook-select-card-info">
                                                    <h3>{notebook.name}</h3>
                                                    <button className="notebook-select-bnt-details">
                                                        {categoryMap[notebook.category] || notebook.category}
                                                    </button>
                                                </div>

                                                <button
                                                    className="select-plus-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNotebookSelection(notebook);
                                                    }}
                                                    title={isSelected ? "Desmarcar" : "Selecionar"}
                                                    style={{
                                                        backgroundColor: isSelected ? '#81C784' : 'transparent',
                                                        borderRadius: '50%',
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: isSelected ? 'none' : 'none',
                                                        transition: 'background-color 0.3s ease'
                                                    }}
                                                >
                                                    {isSelected ? <CheckIcon /> : <PlusIcon />}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p style={{ textAlign: "center", marginTop: "20px" }}>
                                    {searchTerm ? "Nenhum caderno encontrado." : "Nenhum caderno disponível."}
                                </p>
                            )
                        )}
                    </div>

                    {!loading && filteredNotebooks.length > 0 && (
                        <div className="pagination-controls">
                            <a 
                                href="#" 
                                className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(currentPage - 1); }}
                            > &lt; </a>
                            {Array.from({ length: totalPages }, (_, index) => (
                                <a 
                                    key={index + 1}
                                    href="#" 
                                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={(e) => paginate(e, index + 1)}
                                > {index + 1} </a>
                            ))}
                            <a 
                                href="#" 
                                className={`page-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                                onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                            > &gt; </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default SessionNotebookPage;