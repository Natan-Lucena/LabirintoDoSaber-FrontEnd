import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import iconDoubleCard from "../../assets/images/iconDoublecard.png";
import iconSeta from "../../assets/images/seta_icon.png";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/ui/NavBar/index.js";

// Ícone de Mais (+)
const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12H19" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Ícone de Check (para indicar selecionado)
const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="#AEE2E0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

function GroupSelectPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Recebe o ID do caderno e os grupos atuais (para não duplicar ou para manter o histórico)
    // Exemplo de chamada na página anterior: navigate('/GroupSelect', { state: { notebookId: '123', currentGroupIds: ['abc'] } })
    const { notebookId, currentGroupIds = [] } = location.state || {};

    const [availableGroups, setAvailableGroups] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); // Apenas os NOVOS selecionados
    const [loading, setLoading] = useState(true);

    const categoryMap = {
        'reading': 'Leitura',
        'writing': 'Escrita',
        'vocabulary': 'Vocabulário',
        'comprehension': 'Compreensão'
    };

    // --- 1. BUSCAR TODOS OS GRUPOS DO EDUCADOR ---
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/task-group/list-by-educator`, config);
                
                // Filtra para não mostrar grupos que já estão no caderno (opcional, mas melhora a UX)
                // Se quiser mostrar todos e apenas marcar como "já adicionado", a lógica seria diferente.
                // Aqui vou mostrar todos, mas os que já estão no caderno virão desabilitados ou pré-marcados?
                // Vamos mostrar todos.
                setAvailableGroups(response.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar grupos:", error);
                setLoading(false);
            }
        };

        if (!notebookId) {
            alert("ID do caderno não identificado. Retornando...");
            navigate(-1);
            return;
        }

        fetchGroups();
    }, [notebookId, navigate]);

    // --- 2. SELECIONAR / DESELECIONAR GRUPO ---
    const toggleSelection = (groupId) => {
        // Se o grupo já faz parte do caderno original, ignoramos ou avisamos (opcional)
        if (currentGroupIds.includes(groupId)) return; 

        setSelectedIds(prev => {
            if (prev.includes(groupId)) {
                return prev.filter(id => id !== groupId); // Remove se já estava selecionado
            } else {
                return [...prev, groupId]; // Adiciona
            }
        });
    };

    // --- 3. SALVAR (ATUALIZAR CADERNO) ---
    const handleSaveToNotebook = async () => {
        if (selectedIds.length === 0) {
            alert("Nenhum grupo novo selecionado.");
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // O endpoint UPDATE substitui a lista de IDs? Geralmente sim.
            // Então enviamos: IDs Antigos + IDs Novos Selecionados
            const finalGroupIds = [...currentGroupIds, ...selectedIds];

            const payload = {
                taskNotebookId: notebookId,
                taskGroupsIds: finalGroupIds
            };

            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/task-notebook/update`, payload, config);

            alert("Grupos adicionados com sucesso!");
            // Volta para a tela do caderno
           navigate('/NotebookDetails', { 
                state: { notebookId: notebookId } 
            });

        } catch (error) {
            console.error("Erro ao atualizar caderno:", error);
            alert("Erro ao adicionar grupos ao caderno.");
        }
    };

    // Estilo para indicar visualmente que o item já está no caderno
    const isAlreadyInNotebook = (id) => currentGroupIds.includes(id);

    return (
        <div className="dashboard-container">
            <Navbar activePage="activities" />

            <main className="manage-group-select-main-content">
                
                <div className="manage-group-select-container">
                    <div className="top-container">
                        <h1>Adicionar Atividades</h1>
                        <h2>Selecione os grupos para adicionar ao caderno</h2>
                    </div>

                    <div className="group-select-card-list">
                        
                        {loading ? (
                            <p>Carregando grupos...</p>
                        ) : (
                            availableGroups.map((group) => {
                                const isSelected = selectedIds.includes(group.id);
                                const isOwned = isAlreadyInNotebook(group.id);

                                return (
                                    <div 
                                        className="group-select-row-wrapper" 
                                        key={group.id}
                                        onClick={() => !isOwned && toggleSelection(group.id)}
                                        style={{ 
                                            opacity: isOwned ? 0.6 : 1, 
                                            cursor: isOwned ? "default" : "pointer" 
                                        }}
                                    >
                                        <div 
                                            className="group-select-list-item-card" 
                                            style={{ 
                                                border: isSelected ? "2px solid #AEE2E0" : "1px solid #ddd",
                                                backgroundColor: isSelected ? "#F3FBFB" : "#fff"
                                            }}
                                        >
                                            <img src={iconDoubleCard} alt="Icone" className="group-select-card-icon" />
                                            
                                            <div className="group-select-card-info">
                                                <h3>{group.name || "Sem Nome"}</h3>
                                                <button className="group-select-bnt-details">
                                                    {categoryMap[group.category] || group.category}
                                                </button>
                                                {isOwned && <span style={{fontSize: '12px', color: 'gray', marginLeft: '10px'}}>(Já adicionado)</span>}
                                            </div>
                                            
                                            {/* Opcional: manter a seta se quiser ver detalhes, ou remover se for só seleção */}
                                            {/* <span className="back-arrow"><img src={iconSeta} alt="seta" className="seta" /></span> */}
                                        </div>

                                        {/* BOTÃO DE MAIS (+) OU CHECK */}
                                        <button 
                                            className="remove-group-select-btn" 
                                            style={{ 
                                                backgroundColor: isSelected ? "#e8f5e9" : "#f0f0f0",
                                                border: "none"
                                            }}
                                            title={isOwned ? "Já no caderno" : "Adicionar este grupo"}
                                            disabled={isOwned}
                                        >
                                            {isOwned || isSelected ? <CheckIcon /> : <PlusIcon />}
                                        </button>
                                    </div>
                                );
                            })
                        )}

                    </div>

                    {/* Controles de Paginação (Frontend ou API se tiver paginação no backend) */}
                    {/* Mantido estático por enquanto conforme seu design original */}
                    {!loading && availableGroups.length > 0 && (
                        <div className="pagination-controls">
                            <a href="#" className="page-arrow">&lt;</a>
                            <a href="#" className="page-number active">1</a>
                            <a href="#" className="page-arrow">&gt;</a>
                        </div>
                    )}

                    {/* BOTÃO FLUTUANTE DE SALVAR */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', marginBottom: '40px' }}>
                        <button 
                            onClick={handleSaveToNotebook}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#AEE2E0',
                                color: '#000',
                                border: 'none',
                                borderRadius: '30px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                width: '100%',
                                maxWidth: '300px',
                                fontFamily: 'Nunito',
                                fontWeight: 'bold'
                            }}
                        >
                            Adicionar Grupos Selecionados
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default GroupSelectPage;