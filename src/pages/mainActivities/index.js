import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import PageTurner from "../../components/ui/PageTurner/index.js";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const categoryMap = {
  reading: "Leitura",
  writing: "Escrita",
  vocabulary: "Vocabulário",
  comprehension: "Compreensão",
};

const FILTERS = [
  { key: "all", label: "Ver Tudo" },
  { key: "notebook", label: "Cadernos" },
  { key: "group", label: "Grupos" },
  { key: "task", label: "Atividades" },
];

const TYPE_LABELS = {
  notebook: "Caderno",
  group: "Grupo",
  task: "Atividade",
};

const PASTEL_COLORS = [
  "#D8F5F3",
  "#FDE3EE",
  "#FDF3D4",
  "#DCEAFB",
  "#E9E1FB",
  "#FDE3E3",
];

const ITEMS_PER_PAGE = 6;

const NotebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 6C12 6 10 4.5 6.5 4.5C4.5 4.5 3 5 3 5V19C3 19 4.5 18.5 6.5 18.5C10 18.5 12 20 12 20M12 6C12 6 14 4.5 17.5 4.5C19.5 4.5 21 5 21 5V19C21 19 19.5 18.5 17.5 18.5C14 18.5 12 20 12 20M12 6V20"
      stroke="#008D85"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GroupIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7.5H19C20.1046 7.5 21 8.39543 21 9.5V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
      stroke="#008D85"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M3 10.5H21" stroke="#008D85" strokeWidth="1.8" />
  </svg>
);

const TaskIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const TYPE_ICONS = {
  notebook: <NotebookIcon />,
  group: <GroupIcon />,
  task: <TaskIcon />,
};

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10.5" cy="10.5" r="6.5" stroke="#999" strokeWidth="1.8" />
    <path d="M15.5 15.5L20 20" stroke="#999" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

function ActivitiesMainPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createRef = useRef(null);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/");
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const [notebooksRes, groupsRes, tasksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/task-notebook/`, config),
          axios.get(`${API_BASE_URL}/task-group/list-by-educator`, config),
          axios.get(`${API_BASE_URL}/task/`, config),
        ]);

        const notebooks = (Array.isArray(notebooksRes.data) ? notebooksRes.data : []).map(
          (item) => ({
            id: item.notebook.id,
            type: "notebook",
            title: item.notebook.description || "Caderno sem título",
            subtitle:
              item.taskGroups?.length > 0
                ? `${item.taskGroups.length} grupo(s) de atividades`
                : "Nenhum grupo vinculado",
            categories: item.notebook.category ? [item.notebook.category] : [],
          }),
        );

        const groups = (Array.isArray(groupsRes.data) ? groupsRes.data : []).map((group) => ({
          id: group.id,
          type: "group",
          title: group.name || "Grupo sem título",
          subtitle:
            group.tasksIds?.length > 0
              ? `${group.tasksIds.length} atividade(s)`
              : "Nenhuma atividade vinculada",
          categories: group.category ? [group.category] : [],
        }));

        const tasks = (Array.isArray(tasksRes.data) ? tasksRes.data : []).map((task) => ({
          id: task.id,
          type: "task",
          title: task.prompt || "Atividade sem título",
          subtitle:
            task.type === "multipleChoiceWithMedia"
              ? "Múltipla escolha com mídia"
              : "Múltipla escolha",
          categories: task.category ? [task.category] : [],
        }));

        setItems([...notebooks, ...groups, ...tasks]);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (error.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [navigate]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) {
        setIsCreateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (activeFilter !== "all" && item.type !== activeFilter) return false;
      if (term && !item.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [items, activeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const pagedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const changeFilter = (key) => {
    setActiveFilter(key);
    setCurrentPage(1);
  };

  const changeSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateNavigate = (path) => {
    setIsCreateOpen(false);
    navigate(path);
  };

  const handleDetails = (item) => {
    if (item.type === "notebook") {
      navigate("/NotebookDetails", { state: { notebookId: item.id } });
    } else if (item.type === "group") {
      navigate("/GroupDetails", { state: { groupId: item.id } });
    } else {
      navigate("/activityDetails", { state: { activityId: item.id } });
    }
  };

  return (
    <div className="atv-page">
      <Navbar activePage="activities" />

      <main className="atv-content">
        {/* Header */}
        <div className="atv-header">
          <div>
            <h1 className="atv-title">Atividades</h1>
            <p className="atv-subtitle">Gerencie cadernos, grupos e atividades</p>
          </div>

          <div className="atv-create-wrapper" ref={createRef}>
            <button
              className="atv-create-btn"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
            >
              <span className="atv-create-plus">+</span>
              Criar novo conteúdo
              <svg width="12" height="8" viewBox="0 0 13 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.5 0.5L6.5 6.5L12.5 0.5" stroke="currentColor" strokeLinecap="round" />
              </svg>
            </button>
            {isCreateOpen && (
              <div className="atv-create-menu">
                <button onClick={() => handleCreateNavigate("/addNotebook")}>
                  Criar Caderno
                </button>
                <button onClick={() => handleCreateNavigate("/GroupActivities")}>
                  Criar Grupo de Atividades
                </button>
                <button onClick={() => handleCreateNavigate("/CreateNewActivitie")}>
                  Criar Atividade
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Busca */}
        <div className="atv-search-box">
          <SearchIcon />
          <input
            type="text"
            className="atv-search-input"
            placeholder="Buscar caderno, grupo ou atividade..."
            value={searchTerm}
            onChange={(e) => changeSearch(e.target.value)}
          />
        </div>

        {/* Chips de filtro */}
        <div className="atv-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`atv-filter-chip ${activeFilter === filter.key ? "active" : ""}`}
              onClick={() => changeFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grid de cards */}
        {loading ? (
          <div className="atv-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="atv-card atv-card-skeleton" key={i}>
                <div className="atv-skeleton atv-skeleton-header" />
                <div className="atv-card-body">
                  <div className="atv-skeleton atv-skeleton-text" style={{ width: "60%" }} />
                  <div className="atv-skeleton atv-skeleton-text" style={{ width: "85%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="atv-empty">
            <p>Nenhum conteúdo encontrado</p>
            <span>
              {items.length === 0
                ? 'Clique em "Criar novo conteúdo" para começar'
                : "Tente ajustar a busca ou os filtros"}
            </span>
          </div>
        ) : (
          <div className="atv-grid">
            {pagedItems.map((item, index) => (
              <div className="atv-card" key={`${item.type}-${item.id}`}>
                <div
                  className="atv-card-header"
                  style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }}
                >
                  <span className="atv-card-icon">{TYPE_ICONS[item.type]}</span>
                </div>
                <div className="atv-card-body">
                  <h3 className="atv-card-title">{item.title}</h3>
                  <p className="atv-card-desc">{item.subtitle}</p>
                  <div className="atv-card-tags">
                    {item.categories.map((cat) => (
                      <span className="atv-card-tag" key={cat}>
                        {categoryMap[cat] || cat}
                      </span>
                    ))}
                  </div>
                  <div className="atv-card-footer">
                    <span className="atv-card-type">{TYPE_LABELS[item.type]}</span>
                    <button className="atv-card-details-btn" onClick={() => handleDetails(item)}>
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <PageTurner
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>
    </div>
  );
}

export default ActivitiesMainPage;
