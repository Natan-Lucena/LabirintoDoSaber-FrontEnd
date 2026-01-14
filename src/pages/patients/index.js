import React, { useState, useEffect } from 'react';
import './style.css'; 
import axios from 'axios'; 
import Navbar from "../../components/ui/NavBar/index.js";
import PageTurner from '../../components/ui/PageTurner/index.js';
import iconRandom from '../../assets/images/icon_random.png';
import { useNavigate } from 'react-router-dom'; 

function AlunosPage() {
  const navigate = useNavigate(); 
  const [alunos, setAlunos] = useState([]); 
  const [loading, setLoading] = useState(true); 
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; 


  const handleAlunoClick = (studentId) => {
    navigate(`/alunosDetails`, { 
        state: { 
            studentId: studentId 
        } 
    });
  };


  const handleEditClick = (e, studentId) => {
    e.stopPropagation(); 
    navigate(`/alunosDetails`, { 
        state: { 
            studentId: studentId 
        } 
    });
  };

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const educatorId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        if (!educatorId || !token) {
          alert('Sessão inválida. Por favor, faça login novamente.');
          navigate('/');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/student/`, config);
        
        let listaCompleta = [];
        if (Array.isArray(response.data)) {
            listaCompleta = response.data;
        } else if (response.data && Array.isArray(response.data.students)) {
            listaCompleta = response.data.students; 
        }

        const meusAlunos = listaCompleta.filter(aluno => String(aluno.educatorId) === String(educatorId));

        setAlunos(meusAlunos);
        setLoading(false);

      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [navigate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlunos = alunos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(alunos.length / itemsPerPage);


  const paginate = (page) => setCurrentPage(page);


  return (
    <div className="dashboard-container">
      <Navbar />

      <main className="alunos-main-content">
        <div className="alunos-container">
        
          <div className="top-container">
            <div>
              <h1>Alunos</h1>
              <p className="subtitle">Visualize e gerencie informações e progresso de cada aluno.</p>
            </div>

            <button 
              className="create-patient-bnt" 
              onClick={ () => navigate('/CreatePacient') } 
            >
              Cadastrar novo aluno
            </button>
          </div>

          <div className="student-card-list">
            
            {loading ? (
                <p>Carregando alunos...</p>
            ) : alunos.length === 0 ? (
                <div style={{textAlign: 'center', width: '100%', padding: '20px'}}>
                    <p>Nenhum aluno encontrado.</p>
                </div>
            ) : (
                currentAlunos.map((aluno) => (
                    <div 
                        key={aluno.id} 
                        className="student-list-item-card" 
                        onClick={() => handleAlunoClick(aluno.id)} 
                        style={{cursor: 'pointer'}}
                    >
                        <img
                          src={aluno.photoUrl || iconRandom}
                          alt={aluno.name || "Avatar"}
                          className="student-card-avatar"
                          onError={(e) => {
                            e.currentTarget.src = iconRandom;
                          }}
                        />

                        <div className="student-card-info">
                            <h3>{aluno.name}</h3>
                            <p>{aluno.age} anos</p>
                            <p className="student-topic">
                                {aluno.learningTopics && aluno.learningTopics.length > 0 
                                    ? aluno.learningTopics[0] 
                                    : "Sem objetivo definido"}
                            </p>
                        </div>
                    
                        <button 
                            className="edit-profile-btn" 
                            onClick={(e) => handleEditClick(e, aluno.id)}
                        >
                            Editar perfil
                        </button>
                    </div>
                ))
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