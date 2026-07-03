import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import iconBack from "../../assets/images/seta_icon_esquerda.png";
import iconSave from "../../assets/images/icon-salvar.png";
import iconTrash from "../../assets/images/trash.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CATEGORIES = [
  { label: "Leitura", value: "reading", icon: "📖", color: "#D8F5F3" },
  { label: "Escrita", value: "writing", icon: "✏️", color: "#FDE3EE" },
  { label: "Vocabulário", value: "vocabulary", icon: "💬", color: "#FDF3D4" },
  { label: "Compreensão", value: "comprehension", icon: "🧠", color: "#E9E1FB" },
];

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 MB

let localIdCounter = 0;
function newLocalId() {
  return `local_${++localIdCounter}`;
}

function newAlternative(text = "", isCorrect = false) {
  return { _localId: newLocalId(), text, isCorrect };
}

function newTask() {
  return {
    _localId: newLocalId(),
    prompt: "",
    alternatives: [newAlternative("", true), newAlternative()],
    imageFile: null, // File local — enviado junto no multipart do /task/create
    audioFile: null,
  };
}

function CreateActivitiesPage() {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("reading");
  const [tasks, setTasks] = useState([newTask()]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Mutações de atividades / alternativas ──────────────────────────────────

  const addTask = () => {
    setTasks((prev) => [...prev, newTask()]);
  };

  const removeTask = (localId) => {
    setTasks((prev) => prev.filter((t) => t._localId !== localId));
  };

  const updateTask = (localId, field, value) => {
    setTasks((prev) =>
      prev.map((t) => (t._localId === localId ? { ...t, [field]: value } : t)),
    );
  };

  const addTaskAlternative = (taskLocalId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t._localId === taskLocalId
          ? { ...t, alternatives: [...t.alternatives, newAlternative()] }
          : t,
      ),
    );
  };

  const updateAlternativeText = (taskLocalId, altLocalId, text) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._localId !== taskLocalId) return t;
        return {
          ...t,
          alternatives: t.alternatives.map((alt) =>
            alt._localId === altLocalId ? { ...alt, text } : alt,
          ),
        };
      }),
    );
  };

  const markCorrectAlternative = (taskLocalId, altLocalId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._localId !== taskLocalId) return t;
        return {
          ...t,
          alternatives: t.alternatives.map((alt) => ({
            ...alt,
            isCorrect: alt._localId === altLocalId,
          })),
        };
      }),
    );
  };

  const removeAlternative = (taskLocalId, altLocalId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t._localId !== taskLocalId) return t;
        return {
          ...t,
          alternatives: t.alternatives.filter((alt) => alt._localId !== altLocalId),
        };
      }),
    );
  };

  const attachMedia = (taskLocalId, kind, file) => {
    if (!file) return;
    setErrorMsg("");
    if (file.size > MAX_MEDIA_SIZE) {
      setErrorMsg("O arquivo deve ter no máximo 10 MB.");
      return;
    }
    updateTask(taskLocalId, kind === "image" ? "imageFile" : "audioFile", file);
  };

  const removeMedia = (taskLocalId, kind) => {
    updateTask(taskLocalId, kind === "image" ? "imageFile" : "audioFile", null);
  };

  // ── Validação & salvamento (POST /task/create por atividade) ───────────────

  const validate = () => {
    if (tasks.length === 0) {
      setErrorMsg("Adicione pelo menos uma atividade.");
      return false;
    }
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const num = i + 1;
      if (!t.prompt.trim()) {
        setErrorMsg(`A atividade ${num} está sem enunciado.`);
        return false;
      }
      const filledAlts = t.alternatives.filter((alt) => alt.text.trim());
      if (filledAlts.length < 2) {
        setErrorMsg(`A atividade ${num} precisa de pelo menos 2 alternativas preenchidas.`);
        return false;
      }
      if (filledAlts.filter((alt) => alt.isCorrect).length !== 1) {
        setErrorMsg(`A atividade ${num} precisa de exatamente 1 alternativa correta.`);
        return false;
      }
    }
    return true;
  };

  const buildFormData = (task) => {
    const hasMedia = Boolean(task.imageFile || task.audioFile);
    const formData = new FormData();
    formData.append("category", selectedCategory);
    formData.append("type", hasMedia ? "multipleChoiceWithMedia" : "multipleChoice");
    formData.append("prompt", task.prompt.trim());
    formData.append(
      "alternatives",
      JSON.stringify(
        task.alternatives
          .filter((alt) => alt.text.trim())
          .map((alt) => ({ text: alt.text.trim(), isCorrect: alt.isCorrect })),
      ),
    );
    if (task.imageFile) formData.append("imageFile", task.imageFile);
    if (task.audioFile) formData.append("audioFile", task.audioFile);
    return formData;
  };

  const handleSave = async () => {
    setErrorMsg("");
    if (!validate()) return;

    setSaving(true);
    const token = localStorage.getItem("authToken");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const failed = [];
    for (const task of tasks) {
      try {
        await axios.post(`${API_BASE_URL}/task/create`, buildFormData(task), config);
      } catch (error) {
        console.error("Erro ao criar atividade:", error);
        failed.push(task);
      }
    }
    setSaving(false);

    if (failed.length === 0) {
      navigate("/activitiesMain");
      return;
    }

    // Mantém na tela apenas as que falharam, para reenvio
    const savedCount = tasks.length - failed.length;
    setTasks(failed);
    setErrorMsg(
      savedCount > 0
        ? `${savedCount} atividade(s) criada(s), mas ${failed.length} falhou(aram). As que falharam continuam abaixo — tente salvar novamente.`
        : "Erro ao criar as atividades. Verifique os dados e tente novamente.",
    );
  };

  return (
    <div className="ta-page">
      <Navbar activePage="activities" />

      <div className="ta-content">
        {/* Topbar */}
        <div className="ta-topbar">
          <div className="ta-topbar-left">
            <button className="ta-back-btn" onClick={() => navigate("/activitiesMain")}>
              <img src={iconBack} alt="Voltar" />
            </button>
            <div>
              <h1 className="ta-page-title">Criar Atividades</h1>
              <p className="ta-page-subtitle">
                Monte uma ou várias atividades e salve tudo de uma vez
              </p>
            </div>
          </div>
          <button className="ta-save-btn" onClick={handleSave} disabled={saving}>
            <img src={iconSave} alt="Salvar" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {errorMsg && <div className="ta-form-error">{errorMsg}</div>}

        {/* Categorias */}
        <div className="ta-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`ta-category-tile ${selectedCategory === cat.value ? "selected" : ""}`}
              style={{ backgroundColor: cat.color }}
              onClick={() => setSelectedCategory(cat.value)}
              type="button"
            >
              <span className="ta-category-icon">{cat.icon}</span>
              <span className="ta-category-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Atividades */}
        <div className="ta-section">
          <div className="ta-tasks-header">
            <h2 className="ta-section-title">Atividades ({tasks.length})</h2>
            <button className="ta-add-task-btn" onClick={addTask}>
              + Adicionar Atividade
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="ta-tasks-empty">
              <p>Nenhuma atividade adicionada</p>
              <span>Clique em "Adicionar Atividade" para começar</span>
            </div>
          ) : (
            <div className="ta-tasks-list">
              {tasks.map((task, index) => (
                <div key={task._localId} className="ta-task-card">
                  <div className="ta-task-top">
                    <span className="ta-task-label">Atividade {index + 1}</span>
                    <button
                      className="ta-remove-task-btn"
                      onClick={() => removeTask(task._localId)}
                      title="Remover atividade"
                    >
                      <img src={iconTrash} alt="Remover" />
                    </button>
                  </div>

                  <input
                    type="text"
                    className="ta-form-input"
                    placeholder="Digite o enunciado da atividade..."
                    value={task.prompt}
                    onChange={(e) => updateTask(task._localId, "prompt", e.target.value)}
                  />

                  <div className="ta-alternatives-section">
                    <label className="ta-label">Alternativas (marque a correta) *</label>
                    <div className="ta-alternatives-list">
                      {task.alternatives.map((alt, altIdx) => (
                        <div key={alt._localId} className="ta-alternative-row">
                          <input
                            type="radio"
                            name={`correct-${task._localId}`}
                            checked={alt.isCorrect}
                            onChange={() =>
                              markCorrectAlternative(task._localId, alt._localId)
                            }
                            title="Alternativa correta"
                          />
                          <input
                            type="text"
                            className="ta-form-input ta-alternative-input"
                            placeholder={`Alternativa ${altIdx + 1}`}
                            value={alt.text}
                            onChange={(e) =>
                              updateAlternativeText(
                                task._localId,
                                alt._localId,
                                e.target.value,
                              )
                            }
                          />
                          <button
                            className="ta-remove-alt-btn"
                            onClick={() => removeAlternative(task._localId, alt._localId)}
                            title="Remover alternativa"
                          >
                            <img src={iconTrash} alt="Remover" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="ta-add-alt-btn"
                      onClick={() => addTaskAlternative(task._localId)}
                    >
                      + Adicionar Alternativa
                    </button>
                  </div>

                  <div className="ta-media-section">
                    <label className="ta-label">Mídia (opcional)</label>
                    <div className="ta-media-controls">
                      {task.imageFile ? (
                        <span className="ta-media-badge">
                          🖼️ {task.imageFile.name}
                          <button
                            onClick={() => removeMedia(task._localId, "image")}
                            title="Remover imagem"
                          >
                            ×
                          </button>
                        </span>
                      ) : (
                        <label className="ta-media-upload-btn">
                          + Imagem
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              attachMedia(task._localId, "image", e.target.files[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                      {task.audioFile ? (
                        <span className="ta-media-badge">
                          🎵 {task.audioFile.name}
                          <button
                            onClick={() => removeMedia(task._localId, "audio")}
                            title="Remover áudio"
                          >
                            ×
                          </button>
                        </span>
                      ) : (
                        <label className="ta-media-upload-btn">
                          + Áudio
                          <input
                            type="file"
                            accept="audio/*"
                            hidden
                            onChange={(e) => {
                              attachMedia(task._localId, "audio", e.target.files[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateActivitiesPage;
