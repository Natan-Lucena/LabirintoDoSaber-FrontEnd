import React, { useState, useEffect } from "react";
import axios from "axios"; // Importando axios igual na Home
import "./style.css";
import logo from "../../assets/images/logo.png";
import iconNotification from "../../assets/images/icon_notification.png";
import iconProfile from "../../assets/images/icon_profile.png";
import iconArrowLeft from "../../assets/images/seta_icon_esquerda.png";
import patientAvatar from "../../assets/images/icon_random.png";
import iconSeta from "../../assets/images/seta_icon.png";
import SearchBar from "../../components/ui/SearchBar/Search";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/ui/NavBar/index.js";
function SessionPage() {
    const navigate = useNavigate();
    
    // Estados
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // --- BUSCA DE DADOS (CORRIGIDA COM TOKEN) ---
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // 1. Pega o token salvo (Igual na Home)
                const token = localStorage.getItem('authToken');

                if (!token) {
                    console.error("Token não encontrado");
                    navigate('/'); // Redireciona se não tiver token
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // 2. Faz a chamada com Axios passando o config
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/student/`, config);
                
                // 3. Formata os dados
                const formattedData = response.data.map(student => ({
                    id: student.id,
                    name: student.name,
                    age: student.age,
                    photoUrl: student.photoUrl,
                    status: student.learningTopics && student.learningTopics.length > 0 
                            ? student.learningTopics[0] 
                            : "Geral"
                }));

                // Ordenar por nome (opcional, mas ajuda na busca)
                formattedData.sort((a, b) => a.name.localeCompare(b.name));

                setPatients(formattedData);
                setLoading(false);

            } catch (error) {
                console.error("Erro ao buscar alunos:", error);
                // Se der erro de autorização (401), joga pro login igual na Home
                if (error.response && error.response.status === 401) {
                    alert("Sessão expirada.");
                    navigate('/');
                }
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);

    const handleFilterAction = () => {
        console.log("Filtros...");
    };
    
    const handlePatientClick = (patientId) => {
        const nextScreenPath = `/sessionTitle`;
        navigate(nextScreenPath, { state: { studentId: patientId } });

    };

    // --- LÓGICA DE FILTRO E PAGINAÇÃO ---

    // 1. Filtra
    const filteredPatients = patients.filter((patient) => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Pagina
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

    // Controles
    const goToNextPage = (e) => {
        e.preventDefault();
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goToPrevPage = (e) => {
        e.preventDefault();
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const paginate = (e, pageNumber) => {
        e.preventDefault();
        setCurrentPage(pageNumber);
    };

    return (
        <div className="dashboard-container">
            <Navbar activePage="activities" />

            <main className="session-main-content">
                <div className="session-container">
                    <a href="/Home" className="back-arrow-link">
                        <img src={iconArrowLeft} alt="Voltar" className="back-arrow-icon"/>
                    </a>
                    
                    <div className="session-header-top">
                        <h1>Sessão de atendimento</h1>
                        
                        <div className="search-filter-group">
                            <SearchBar 
                                searchTerm={searchTerm}
                                setSearchTerm={(value) => {
                                    setSearchTerm(value);
                                    setCurrentPage(1); 
                                }}
                                placeholder="Selecione o paciente..." 
                                onFilterClick={handleFilterAction}
                            />          
                        </div>
                    </div>
                    
                    <div className="select-patient">
                        <h2 className="session-subtitle-session">Selecione o paciente que realizará a sessão</h2>
                        
                        {loading ? (
                            <p style={{textAlign: 'center', color: '#666'}}>Carregando alunos...</p>
                        ) : (
                            <div className="patient-card-list">
                                {currentItems.length > 0 ? (
                                    currentItems.map((patient) => (
                                        <div 
                                            key={patient.id}
                                            className="patient-list-item-card"
                                            onClick={() => handlePatientClick(patient.id)}
                                            style={{ cursor: "pointer" }}
                                        >
                                           <img
                                            src={patient.photoUrl || patientAvatar}
                                            alt={`Avatar de ${patient.name}`}
                                            className="patient-avatar"
                                            onError={(e) => {
                                                e.currentTarget.src = patientAvatar;
                                            }}
                                            />
                                            <div className="patient-card-info">
                                                <h3>{patient.name}</h3>
                                                <p>{patient.age} anos</p>
                                                <p className="patient-status">{patient.status}</p>
                                            </div>
                                            
                                            <div className="patient-card-action">
                                                <img src={iconSeta} alt="Avançar" className="seta"/>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{textAlign: 'center', marginTop: '20px'}}>
                                        {searchTerm ? "Nenhum aluno encontrado com esse nome." : "Nenhum aluno cadastrado."}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Paginação */}
                    {!loading && filteredPatients.length > 0 && (
                        <div className="pagination-controls">
                            <a 
                                href="#" 
                                className={`page-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                                onClick={goToPrevPage}
                                style={{ pointerEvents: currentPage === 1 ? 'none' : 'auto', opacity: currentPage === 1 ? 0.5 : 1 }}
                            >
                                &lt;
                            </a>

                            {Array.from({ length: totalPages }, (_, index) => (
                                <a 
                                    key={index + 1}
                                    href="#" 
                                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={(e) => paginate(e, index + 1)}
                                >
                                    {index + 1}
                                </a>
                            ))}

                            <a 
                                href="#" 
                                className={`page-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                                onClick={goToNextPage}
                                style={{ pointerEvents: currentPage === totalPages ? 'none' : 'auto', opacity: currentPage === totalPages ? 0.5 : 1 }}
                            >
                                &gt;
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default SessionPage;