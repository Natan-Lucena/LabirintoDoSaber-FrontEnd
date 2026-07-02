import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import iconBack from "../../assets/images/seta_icon_esquerda.png";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const categoryMap = {
  reading: "Leitura",
  writing: "Escrita",
  vocabulary: "Vocabulário",
  comprehension: "Compreensão",
};

const TaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 3H14L19 8V21H6C5.44772 21 5 20.5523 5 20V4C5 3.44772 5.44772 3 6 3Z"
      stroke="#008D85"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M14 3V8H19" stroke="#008D85" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M9 12H15" stroke="#008D85" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M9 16H13" stroke="#008D85" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function GroupDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId;

  const [group, setGroup] = useState(null);
  const [groupTasks, setGroupTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!groupId) {
      navigate("/activitiesMain");
      return;
    }

    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [groupsRes, tasksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/task-group/list-by-educator`, config),
          axios.get(`${API_BASE_URL}/task/`, config),
        ]);

        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : [];
        const allTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];

        const found = groups.find((g) => g.id === groupId);
        if (!found) {
          setErrorMsg("Grupo de atividades não encontrado.");
          return;
        }

        setGroup(found);
        const taskIds = Array.isArray(found.tasksIds) ? found.tasksIds : [];
        setGroupTasks(allTasks.filter((task) => taskIds.includes(task.id)));
      } catch (error) {
        console.error("Erro ao carregar grupo:", error);
        if (error.response?.status === 401) {
          navigate("/");
          return;
        }
        setErrorMsg("Erro ao carregar os detalhes do grupo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, navigate]);

  if (loading) {
    return (
      <div className="gd-page">
        <Navbar activePage="activities" />
        <div className="gd-content">
          <p className="gd-loading">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gd-page">
      <Navbar activePage="activities" />

      <div className="gd-content">
        {/* Topbar */}
        <div className="gd-topbar">
          <button className="gd-back-btn" onClick={() => navigate("/activitiesMain")}>
            <img src={iconBack} alt="Voltar" />
          </button>
          <div>
            <h1 className="gd-page-title">{group?.name || "Grupo de Atividades"}</h1>
            <p className="gd-page-subtitle">Detalhes do grupo de atividades</p>
          </div>
        </div>

        {errorMsg && <div className="gd-form-error">{errorMsg}</div>}

        {group && (
          <>
            {/* Informações do grupo */}
            <div className="gd-section">
              <h2 className="gd-section-title">Informações do Grupo</h2>
              <div className="gd-info-row">
                <span className="gd-info-tag">
                  {categoryMap[group.category] || group.category}
                </span>
                <span className="gd-info-count">
                  {groupTasks.length} atividade(s)
                </span>
              </div>
            </div>

            {/* Atividades do grupo */}
            <div className="gd-section">
              <h2 className="gd-section-title">Atividades ({groupTasks.length})</h2>
              {groupTasks.length === 0 ? (
                <div className="gd-empty">
                  <p>Nenhuma atividade vinculada a este grupo</p>
                </div>
              ) : (
                <div className="gd-tasks-list">
                  {groupTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className="gd-task-card"
                      onClick={() =>
                        navigate("/activityDetails", { state: { activityId: task.id } })
                      }
                    >
                      <TaskIcon />
                      <span className="gd-task-info">
                        <span className="gd-task-prompt">
                          {task.prompt || "Atividade sem título"}
                        </span>
                        <span className="gd-task-meta">
                          {task.type === "multipleChoiceWithMedia"
                            ? "Múltipla escolha com mídia"
                            : "Múltipla escolha"}
                          {" · "}
                          {categoryMap[task.category] || task.category}
                        </span>
                      </span>
                      <span className="gd-task-arrow">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GroupDetailsPage;
