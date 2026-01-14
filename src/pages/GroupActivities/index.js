import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css'; 
import logo from '../../assets/images/logo.png';
import iconNotification from '../../assets/images/icon_notification.png';
import iconProfile from '../../assets/images/icon_profile.png';
import iconBack from '../../assets/images/seta_icon_esquerda.png';
import { useNavigate } from 'react-router-dom';
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

const TrashIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 6H19L18.1245 19.133C18.0544 20.1836 17.1818 21 16.1289 21H7.87111C6.81818 21 5.94558 20.1836 5.87554 19.133L5 6Z" stroke="black" strokeWidth="2"/>
        <path d="M9 6V3H15V6" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M3 6H21" stroke="black" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 10V17" stroke="black" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 10V17" stroke="black" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const AddIcon = () => (
    <svg width="29" height="31" viewBox="0 0 29 31" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_150_1802)">
            <path d="M19.5 12H9.5" stroke="black" strokeLinecap="round"/>
            <path d="M14.5 17V7" stroke="black" strokeLinecap="round"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M14.5 22C20.0228 22 24.5 17.5228 24.5 12C24.5 6.47715 20.0228 2 14.5 2C8.97715 2 4.5 6.47715 4.5 12C4.5 17.5228 8.97715 22 14.5 22Z" stroke="black"/>
        </g>
        <defs>
        <filter id="filter0_d_150_1802" x="-1.5" y="0" width="32" height="32" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="4"/>
            <feGaussianBlur stdDeviation="2"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_150_1802"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_150_1802" result="shape"/>
        </filter>
        </defs>
    </svg>
);

function GroupActivitiesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Leitura');
  const [groupName, setGroupName] = useState('');
  
  const [availableTasks, setAvailableTasks] = useState([]);
  
  const [groupActivities, setGroupActivities] = useState([{ uniqueId: Date.now(), taskId: '' }]); 

  const categories = ['Leitura', 'Escrita', 'Vocabulário', 'Compreensão'];
  
  const categoryMap = {
    'Leitura': 'reading',
    'Escrita': 'writing',
    'Vocabulário': 'vocabulary',
    'Compreensão': 'comprehension'
  };

 
  useEffect(() => {
    const fetchTasks = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/task/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (Array.isArray(response.data)) {
                setAvailableTasks(response.data);
            }
        } catch (error) {
            console.error("Erro ao carregar atividades:", error);
        }
    };
    fetchTasks();
  }, []);

  const addGroupActivityRow = () => {
    setGroupActivities([...groupActivities, { uniqueId: Date.now(), taskId: '' }]);
  };

  const removeGroupActivityRow = (uniqueId) => {
    if (groupActivities.length > 1) {
        setGroupActivities(groupActivities.filter(item => item.uniqueId !== uniqueId));
    }
  };

  const updateGroupActivitySelection = (uniqueId, newTaskId) => {
    setGroupActivities(groupActivities.map(item => 
        item.uniqueId === uniqueId ? { ...item, taskId: newTaskId } : item
    ));
  };


  const handleSave = async () => {
    const token = localStorage.getItem('authToken');
    
    // Coleta apenas os IDs das tarefas selecionadas
    const selectedIds = groupActivities
        .map(item => item.taskId)
        .filter(id => id !== '');

   
    if (!groupName.trim()) {
      alert("Por favor, preencha o Nome do Grupo.");
      return;
    }
    if (selectedIds.length === 0) {
      alert("Adicione pelo menos uma atividade válida ao grupo.");
      return;
    }

    // AQUI ESTÁ A MUDANÇA: Usando 'tasksIds' (com S) no payload
    const payload = {
      name: groupName,
      category: categoryMap[selectedCategory] || 'reading',
      tasksIds: selectedIds // A chave aqui agora é explicitamente 'tasksIds'
    };

    console.log("Enviando Payload:", payload);

    try {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/task-group/create`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        alert("Grupo de atividades criado com sucesso!");
        navigate('/activitiesMain'); 

    } catch (error) {
        console.error("Erro ao criar grupo:", error);
        alert("Erro ao criar grupo. Verifique se está logado e tente novamente.");
    }
  };

  return (
    <div className="dashboard-container"> 
      
     <Navbar activePage="activities" />
    
      <main className="main-content">
        <button onClick={() => navigate('/activitiesMain')} className="back-arrow" style={{background: 'none', border: 'none', cursor: 'pointer'}}>
             <img src={iconBack} alt="seta" className="seta"/>
        </button>
        
        <div className="adicionar-atividade-container">
          <h1 className="form-title">Adicionar novo grupo de atividades</h1>
          <hr className="title-separator" />

          <div className="form-group">
            <label className="form-label required">Categoria do Grupo</label>
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
            <label className="form-label required">Nome do novo grupo</label>
            <input 
              type="text" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Exemplo: Caderno de associação e leitura com animais"
              className="text-input" 
            />
          </div>

          
          <div className="form-group">
            <div className="form-label required">Adicione as atividades desejadas</div>

            <div className="activities-list-container">
              {groupActivities.map((item, idx) => (
                <div key={item.uniqueId} className="activity-row">
                  <div className="activity-item">
                    
                    <select
                      className="activity-input-grupo" 
                      value={item.taskId}
                      onChange={(e) => updateGroupActivitySelection(item.uniqueId, e.target.value)}
                      style={{width: '100%', height: '100%', border: 'none', background: 'transparent', outline: 'none'}}
                    >
                        <option value="">Selecione uma atividade...</option>
                        {availableTasks.map(task => (
                            <option key={task.id} value={task.id}>
                                {task.prompt ? (task.prompt.length > 50 ? task.prompt.substring(0,50) + '...' : task.prompt) : 'Atividade sem título'}
                            </option>
                        ))}
                    </select>
                  </div>

                    <button
                        type="button"
                        className="activity-remove-button"
                        onClick={() => removeGroupActivityRow(item.uniqueId)}
                        aria-label="Remover atividade"
                        title="Remover"
                    >
                        <TrashIcon />
                    </button>
                </div>
              ))}
            </div>

            <button type="button" className="activity-add-button" onClick={addGroupActivityRow}>
                <AddIcon />
                Adicionar mais atividades
            </button>
          </div>
         
        
          <div className="next-button-container">
            <button className="button-next" type="button" onClick={handleSave}>
              Salvar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default GroupActivitiesPage;