import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";
import iconBack from "../../assets/images/seta_icon_esquerda.png";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/ui/NavBar/index.js";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CATEGORIES = [
  { label: "Leitura", value: "reading" },
  { label: "Escrita", value: "writing" },
  { label: "Vocabulário", value: "vocabulary" },
  { label: "Compreensão", value: "comprehension" },
];

const categoryMap = {
  reading: "Leitura",
  writing: "Escrita",
  vocabulary: "Vocabulário",
  comprehension: "Compreensão",
};

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 6C12 6 10 4.5 6.5 4.5C4.5 4.5 3 5 3 5V19C3 19 4.5 18.5 6.5 18.5C10 18.5 12 20 12 20M12 6C12 6 14 4.5 17.5 4.5C19.5 4.5 21 5 21 5V19C21 19 19.5 18.5 17.5 18.5C14 18.5 12 20 12 20M12 6V20"
      stroke="#008D85"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7.5H19C20.1046 7.5 21 8.39543 21 9.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      stroke="#008D85"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

function AddNotebookPage() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("reading");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/task-group/list-by-educator`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (Array.isArray(response.data)) {
          setAvailableGroups(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar grupos de atividades:", error);
        setErrorMsg("Erro ao carregar os grupos de atividades.");
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [navigate]);

  const toggleGroup = (groupId) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleSave = async () => {
    setErrorMsg("");

    if (!description.trim()) {
      setErrorMsg("Preencha a descrição do caderno.");
      return;
    }
    if (selectedGroupIds.length === 0) {
      setErrorMsg("Selecione pelo menos um grupo de atividades.");
      return;
    }

    // Agrega os ids de tasks de todos os grupos selecionados (sem duplicatas)
    const aggregatedTaskIds = selectedGroupIds.flatMap((groupId) => {
      const group = availableGroups.find((g) => g.id === groupId);
      return Array.isArray(group?.tasksIds) ? group.tasksIds : [];
    });
    const uniqueTaskIds = [...new Set(aggregatedTaskIds)];

    const payload = {
      tasks: uniqueTaskIds,
      category: selectedCategory,
      description: description.trim(),
      taskGroupsIds: selectedGroupIds,
    };

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${API_BASE_URL}/task-notebook/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/activitiesMain");
    } catch (error) {
      console.error("Erro ao criar caderno:", error);
      if (error.response?.status === 401) {
        setErrorMsg("Sessão expirada. Faça login novamente.");
      } else {
        setErrorMsg("Erro ao criar o caderno. Verifique os dados e tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nb-page">
      <Navbar activePage="activities" />

      <div className="nb-content">
        {/* Topbar */}
        <div className="nb-topbar">
          <button className="nb-back-btn" onClick={() => navigate("/activitiesMain")}>
            <img src={iconBack} alt="Voltar" />
          </button>
          <div>
            <h1 className="nb-page-title">Criar novo caderno</h1>
            <p className="nb-page-subtitle">
              Organize suas atividades em cadernos temáticos
            </p>
          </div>
        </div>

        {errorMsg && <div className="nb-form-error">{errorMsg}</div>}

        {/* Informações do caderno */}
        <div className="nb-section">
          <h2 className="nb-section-title">
            <BookIcon />
            Informações do Caderno
          </h2>
          <div className="nb-field">
            <label className="nb-label">
              Descrição do Caderno <span className="nb-required">*</span>
            </label>
            <textarea
              className="nb-form-textarea"
              placeholder="Ex: Alfabetização Divertida — atividades de reconhecimento de letras e sons"
              value={description}
              rows={3}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="nb-section">
          <h2 className="nb-section-title">
            Categoria <span className="nb-required">*</span>
          </h2>
          <p className="nb-section-hint">Selecione a categoria deste caderno</p>
          <div className="nb-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`nb-category-chip ${selectedCategory === cat.value ? "selected" : ""}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grupos de atividades */}
        <div className="nb-section">
          <div className="nb-groups-header">
            <div>
              <h2 className="nb-section-title">Grupos de Atividades</h2>
              <p className="nb-section-hint">
                Selecione grupos existentes ou crie novos
              </p>
            </div>
            <button
              className="nb-create-group-btn"
              onClick={() => navigate("/GroupActivities")}
            >
              + Criar Grupo
            </button>
          </div>

          {loadingGroups ? (
            <p className="nb-groups-loading">Carregando grupos...</p>
          ) : availableGroups.length === 0 ? (
            <div className="nb-groups-empty">
              <p>Nenhum grupo de atividades encontrado</p>
              <span>Clique em "Criar Grupo" para montar o primeiro</span>
            </div>
          ) : (
            <div className="nb-groups-grid">
              {availableGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={`nb-group-card ${selectedGroupIds.includes(group.id) ? "selected" : ""}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  <FolderIcon />
                  <span className="nb-group-info">
                    <span className="nb-group-name">
                      {group.name || `Grupo - ${categoryMap[group.category] || group.category}`}
                    </span>
                    <span className="nb-group-desc">
                      {group.tasksIds?.length > 0
                        ? `${group.tasksIds.length} atividade(s) · ${categoryMap[group.category] || group.category}`
                        : categoryMap[group.category] || group.category}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="nb-actions">
          <button
            className="nb-cancel-btn"
            onClick={() => navigate("/activitiesMain")}
            disabled={saving}
          >
            Cancelar
          </button>
          <button className="nb-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Criando..." : "Criar Caderno"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddNotebookPage;
