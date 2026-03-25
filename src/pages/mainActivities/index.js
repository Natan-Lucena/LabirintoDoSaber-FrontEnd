import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import iconCaderno from "../../assets/images/caderneta.png";
import iconSeta from "../../assets/images/seta_icon.png";
import { useNavigate } from "react-router-dom";

const categoryMap = {
  reading: "Leitura",
  writing: "Escrita",
  vocabulary: "Vocabulário",
  comprehension: "Compreensão",
};

const PREVIEW_COUNT = 3;

function Section({ title, items, isExpanded, onToggle, loading, emptyText, renderItem }) {
  const displayed = isExpanded ? items : items.slice(0, PREVIEW_COUNT);

  return (
    <div className="activities-section">
      <h2 className="activities-section-title">{title}</h2>
      <div className="student-card-list">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div className="student-list-item-card skeleton-card" key={i}>
              <div className="skeleton skeleton-avatar" />
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text" style={{ width: "40%", marginBottom: 8 }} />
                <div className="skeleton skeleton-text" style={{ width: "60%" }} />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="activities-empty-text">{emptyText}</p>
        ) : (
          displayed.map(renderItem)
        )}
      </div>
      {!loading && items.length > PREVIEW_COUNT && (
        <button className="activities-toggle-btn" onClick={onToggle}>
          {isExpanded ? "Ver menos" : `Ver mais (${items.length - PREVIEW_COUNT} restantes)`}
        </button>
      )}
    </div>
  );
}

function AlunosPage() {
  const navigate = useNavigate();

  const [notebooks, setNotebooks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notebooksExpanded, setNotebooksExpanded] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);

  const [isCriarOpen, setIsCriarOpen] = useState(false);
  const [isGerenciarOpen, setIsGerenciarOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [notebooksRes, groupsRes, activitiesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/task-notebook/`, config),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/task-group/list-by-educator`, config),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/task/`, config),
        ]);

        setNotebooks(Array.isArray(notebooksRes.data) ? notebooksRes.data : []);
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
        setActivities(Array.isArray(activitiesRes.data) ? activitiesRes.data : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (error.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

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
          {/* Header */}
          <div className="top-container-head">
            <h1>Atividades</h1>
            <div className="bnts-top">
              {/* Botão CRIAR */}
              <div className="button-and-subtitle-wrapper">
                <div className={`dropdown-button-container ${isCriarOpen ? "active" : ""}`}>
                  <div className="create-caderno dropdown-toggle" onClick={toggleCriar}>
                    <span>Criar</span>
                    <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow">
                      <path d="M0.5 0.5L6.5 6.5L12.5 0.5" stroke="black" strokeLinecap="round" />
                    </svg>
                  </div>
                  {isCriarOpen && (
                    <div className="dropdown-menu">
                      <button type="button" onClick={() => handleNavigate("/addNotebook")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Criar caderno
                      </button>
                      <button type="button" onClick={() => handleNavigate("/GroupActivities")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Criar grupo de atividades
                      </button>
                      <button type="button" onClick={() => handleNavigate("/CreateNewActivitie")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Criar atividade
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Botão GERENCIAR */}
              <div className="button-and-subtitle-wrapper">
                <div className={`dropdown-button-container ${isGerenciarOpen ? "active" : ""}`}>
                  <div className="create-caderno dropdown-toggle" onClick={toggleGerenciar}>
                    <span>Gerenciar</span>
                    <svg width="13" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="dropdown-arrow">
                      <path d="M0.5 0.5L6.5 6.5L12.5 0.5" stroke="black" strokeLinecap="round" />
                    </svg>
                  </div>
                  {isGerenciarOpen && (
                    <div className="dropdown-menu">
                      <button type="button" onClick={() => handleNavigate("/ManageNotebook")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Gerenciar cadernos
                      </button>
                      <button type="button" onClick={() => handleNavigate("/ManageGroup")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Gerenciar grupo de atividades
                      </button>
                      <button type="button" onClick={() => handleNavigate("/ManageActivities")} style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, font: "inherit" }}>
                        Gerenciar atividades
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Caderno de Atividades */}
          <Section
            title="Caderno de Atividades"
            items={notebooks}
            isExpanded={notebooksExpanded}
            onToggle={() => setNotebooksExpanded(!notebooksExpanded)}
            loading={loading}
            emptyText="Nenhum caderno encontrado."
            renderItem={(item) => (
              <div
                key={item.notebook.id}
                className="student-list-item-card"
                onClick={() => navigate("/NotebookDetails", { state: { notebookId: item.notebook.id } })}
                style={{ cursor: "pointer" }}
              >
                <img src={iconCaderno} alt="Caderno" className="caderno-avatar" />
                <div className="student-card-info">
                  <h3>{item.notebook.description || "Caderno sem título"}</h3>
                  <p>
                    {item.taskGroups.length > 0
                      ? `${item.taskGroups.length} grupo(s) de atividades`
                      : "Nenhum grupo vinculado"}
                  </p>
                  <button className="bnt-details">
                    {categoryMap[item.notebook.category] || "Geral"}
                  </button>
                </div>
                <div className="back-arrow">
                  <img src={iconSeta} alt="seta" className="seta-main" />
                </div>
              </div>
            )}
          />

          {/* Seção: Grupos de Atividades */}
          <Section
            title="Grupos de Atividades"
            items={groups}
            isExpanded={groupsExpanded}
            onToggle={() => setGroupsExpanded(!groupsExpanded)}
            loading={loading}
            emptyText="Nenhum grupo de atividades encontrado."
            renderItem={(group) => (
              <div
                key={group.id}
                className="student-list-item-card"
                onClick={() => navigate("/ManageGroup")}
                style={{ cursor: "pointer" }}
              >
                <img src={iconCaderno} alt="Grupo" className="caderno-avatar" />
                <div className="student-card-info">
                  <h3>{group.name || "Grupo sem título"}</h3>
                  <p>
                    {group.tasksIds?.length > 0
                      ? `${group.tasksIds.length} atividade(s)`
                      : "Nenhuma atividade vinculada"}
                  </p>
                </div>
                <div className="back-arrow">
                  <img src={iconSeta} alt="seta" className="seta-main" />
                </div>
              </div>
            )}
          />

          {/* Seção: Atividades */}
          <Section
            title="Atividades"
            items={activities}
            isExpanded={activitiesExpanded}
            onToggle={() => setActivitiesExpanded(!activitiesExpanded)}
            loading={loading}
            emptyText="Nenhuma atividade encontrada."
            renderItem={(activity) => (
              <div
                key={activity.id}
                className="student-list-item-card"
                onClick={() => navigate("/activityDetails", { state: { activityId: activity.id } })}
                style={{ cursor: "pointer" }}
              >
                <img src={iconCaderno} alt="Atividade" className="caderno-avatar" />
                <div className="student-card-info">
                  <h3>{activity.prompt || "Atividade sem título"}</h3>
                  <button className="bnt-details">
                    {categoryMap[activity.category] || "Geral"}
                  </button>
                </div>
                <div className="back-arrow">
                  <img src={iconSeta} alt="seta" className="seta-main" />
                </div>
              </div>
            )}
          />
        </div>
      </main>
    </div>
  );
}

export default AlunosPage;
