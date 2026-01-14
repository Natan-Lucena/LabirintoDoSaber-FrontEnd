import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import './style.css'; 

import logo from '../../assets/images/logo.png';
import iconNotification from '../../assets/images/icon_notification.png';
import iconProfile from '../../assets/images/icon_profile.png';
import iconBack from '../../assets/images/seta_icon_esquerda.png'; 
import Navbar from "../../components/ui/NavBar/index.js";
const ActivityChip = ({ label, isSelected, onClick }) => (
  <button 
    className={`activity-chip ${isSelected ? 'selected' : ''}`} 
    onClick={onClick}
    type="button"
  >
    {label}
  </button>
);

function AdicionarAtividade() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const [selectedCategory, setSelectedCategory] = useState('Leitura');
    const [activityType, setActivityType] = useState('');
    const [activitySchema, setActivitySchema] = useState('Atividade 1: Imagem, Áudio, Enunciado e Alternativas');

    const categories = ['Leitura', 'Escrita', 'Vocabulário', 'Compreensão'];
    const schemas = [
        'Imagem, Áudio, Enunciado e Alternativas',
        'Imagem, Enunciado e alternativas',
        'Áudio, Enunciado e alternativas',
        'Enunciado e alternativas'
    ];

    const handleNext = () => {
        if (!selectedCategory || !activityType) {
            alert("Por favor, preencha a categoria e o título da atividade.");
            return;
        }

        // --- MUDANÇA AQUI: Navegar para a página nova enviando os dados ---
        // Certifique-se que a rota '/NewActivitiePersonalize' existe no seu Router
        navigate('/NewActivitiePersonalize', { 
            state: { 
                selectedCategory: selectedCategory,
                selectedSchema: activitySchema,
                activityType: activityType
            } 
        });
    };

    return (
        <div className="dashboard-container"> 
           <Navbar activePage="activities" />

            <main className="main-content">
                 <button className="back-button" onClick={() => navigate(-1)} style={{border: 'none', background: 'transparent', cursor: 'pointer', marginBottom: '10px'}}>
                        <img src={iconBack} alt="Voltar" className="seta" />
                 </button>

                <div className="adicionar-atividade-container">
                    <h1 className="form-title">Adicionar nova atividade</h1>
                    <hr className="title-separator" />

                    <div className="form-group">
                        <label className="form-label required">Categoria da atividade</label>
                        <div className="chips-container">
                            {categories.map((cat) => (
                                <ActivityChip 
                                    key={cat}
                                    label={cat}
                                    isSelected={selectedCategory === cat}
                                    onClick={() => setSelectedCategory(cat)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Tipo da atividade (Título)</label>
                        <input 
                            type="text" 
                            value={activityType}
                            onChange={(e) => setActivityType(e.target.value)}
                            placeholder="Exemplo: Atividades de associação e leitura com animais"
                            className="text-input" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label required">Esquema da atividade</label>
                        <div className="select-wrapper">
                            <select 
                                value={activitySchema}
                                onChange={(e) => setActivitySchema(e.target.value)}
                                className="dropdown-select"
                            >
                                {schemas.map((schema) => (
                                    <option key={schema} value={schema}>{schema}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="next-button-container">
                        <button className="button-next" type="button" onClick={handleNext}>
                            Próximo
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdicionarAtividade;