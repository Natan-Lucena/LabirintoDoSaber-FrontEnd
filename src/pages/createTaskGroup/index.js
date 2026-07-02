import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import AiAssistantModal from "./AiAssistantModal.js";
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

const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 MB (limite da API)

let localIdCounter = 0;
function newLocalId() {
  return `local_${++localIdCounter}`;
}

function newAlternative(text = "", isCorrect = false) {
  return { _localId: newLocalId(), text, isCorrect };
}

function newManualTask() {
  return {
    _localId: newLocalId(),
    source: "manual",
    included: true,
    prompt: "",
    alternatives: [newAlternative("", true), newAlternative()],
    imageFile: null,
    audioFile: null,
    uploadingMedia: null,
  };
}

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z"
      fill="#008D85"
    />
    <path d="M19 15L19.9 17.1L22 18L19.9 18.9L19 21L18.1 18.9L16 18L18.1 17.1L19 15Z" fill="#008D85" />
  </svg>
);

function CreateTaskGroupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("reading");
  const [tasks, setTasks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // ── Mutações de atividades / alternativas ──────────────────────────────────

  const addManualTask = () => {
    setTasks((prev) => [...prev, newManualTask()]);
  };

  const addGeneratedTasks = (generated) => {
    setTasks((prev) => [
      ...prev,
      ...generated.map((task) => ({
        _localId: newLocalId(),
        source: "ai",
        included: true,
        prompt: task.prompt || "",
        alternatives: (task.alternatives || []).map((alt) =>
          newAlternative(alt.text || "", Boolean(alt.isCorrect)),
        ),
        imageFile: null,
        audioFile: null,
        uploadingMedia: null,
      })),
    ]);
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

  // ── Upload de mídia (POST /task/upload-media) ──────────────────────────────

  const handleMediaUpload = async (taskLocalId, kind, file) => {
    if (!file) return;
    setErrorMsg("");

    if (file.size > MAX_MEDIA_SIZE) {
      setErrorMsg("O arquivo deve ter no máximo 10 MB.");
      return;
    }

    updateTask(taskLocalId, "uploadingMedia", kind);
    try {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post(`${API_BASE_URL}/task/upload-media`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const field = kind === "image" ? "imageFile" : "audioFile";
      updateTask(taskLocalId, field, data.url);
    } catch (error) {
      console.error("Erro ao enviar mídia:", error);
      if (error.response?.data?.message === "THIS FILE IS TO LARGE") {
        setErrorMsg("O arquivo deve ter no máximo 10 MB.");
      } else {
        setErrorMsg("Erro ao enviar o arquivo. Tente novamente.");
      }
    } finally {
      updateTask(taskLocalId, "uploadingMedia", null);
    }
  };

  const removeMedia = (taskLocalId, kind) => {
    updateTask(taskLocalId, kind === "image" ? "imageFile" : "audioFile", null);
  };

  // ── Validação & salvamento (POST /task/batch) ──────────────────────────────

  const includedTasks = tasks.filter((t) => t.included);

  const validate = () => {
    if (!name.trim()) {
      setErrorMsg("O nome do grupo de atividades é obrigatório.");
      return false;
    }
    if (includedTasks.length === 0) {
      setErrorMsg("Adicione (e mantenha selecionada) pelo menos uma atividade.");
      return false;
    }
    if (tasks.some((t) => t.uploadingMedia)) {
      setErrorMsg("Aguarde o envio da mídia terminar antes de salvar.");
      return false;
    }
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!t.included) continue;
      const num = i + 1;
      if (!t.prompt.trim()) {
        setErrorMsg(`A pergunta ${num} está sem enunciado.`);
        return false;
      }
      const filledAlts = t.alternatives.filter((alt) => alt.text.trim());
      if (filledAlts.length < 2) {
        setErrorMsg(`A pergunta ${num} precisa de pelo menos 2 alternativas preenchidas.`);
        return false;
      }
      if (filledAlts.filter((alt) => alt.isCorrect).length !== 1) {
        setErrorMsg(`A pergunta ${num} precisa de exatamente 1 alternativa correta.`);
        return false;
      }
    }
    return true;
  };

  const buildPayload = () => ({
    name: name.trim(),
    category: selectedCategory,
    tasks: includedTasks.map((t) => {
      const hasMedia = Boolean(t.imageFile || t.audioFile);
      const task = {
        category: selectedCategory,
        type: hasMedia ? "multipleChoiceWithMedia" : "multipleChoice",
        prompt: t.prompt.trim(),
        alternatives: t.alternatives
          .filter((alt) => alt.text.trim())
          .map((alt) => ({ text: alt.text.trim(), isCorrect: alt.isCorrect })),
      };
      if (t.imageFile) task.imageFile = t.imageFile;
      if (t.audioFile) task.audioFile = t.audioFile;
      return task;
    }),
  });

  const handleSave = async () => {
    setErrorMsg("");
    if (!validate()) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      await axios.post(`${API_BASE_URL}/task/batch`, buildPayload(), config);
      navigate("/activitiesMain");
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      const message = error.response?.data?.message;
      if (message === "INVALID_TASK_DATA") {
        setErrorMsg(
          "Alguma atividade está inválida (alternativas, resposta correta ou mídia). Revise e tente novamente.",
        );
      } else if (message === "EMPTY_TASK_LIST") {
        setErrorMsg("Adicione pelo menos uma atividade.");
      } else if (error.response?.status === 401) {
        setErrorMsg("Sessão expirada. Faça login novamente.");
      } else {
        setErrorMsg("Erro ao salvar o grupo de atividades. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tg-page">
      <Navbar activePage="activities" />

      <div className="tg-content">
        {/* Topbar */}
        <div className="tg-topbar">
          <div className="tg-topbar-left">
            <button className="tg-back-btn" onClick={() => navigate("/activitiesMain")}>
              <img src={iconBack} alt="Voltar" />
            </button>
            <h1 className="tg-page-title">Criar Grupo de Atividades</h1>
          </div>
          <button className="tg-save-btn" onClick={handleSave} disabled={saving}>
            <img src={iconSave} alt="Salvar" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {errorMsg && <div className="tg-form-error">{errorMsg}</div>}

        {/* Informações do grupo */}
        <div className="tg-section">
          <h2 className="tg-section-title">Informações do Grupo</h2>
          <div className="tg-field">
            <label className="tg-label">Nome do grupo de atividades *</label>
            <input
              type="text"
              className="tg-form-input"
              placeholder="Ex: Fonemas Funcionais"
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Categorias */}
        <div className="tg-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`tg-category-tile ${selectedCategory === cat.value ? "selected" : ""}`}
              style={{ backgroundColor: cat.color }}
              onClick={() => setSelectedCategory(cat.value)}
              type="button"
            >
              <span className="tg-category-icon">{cat.icon}</span>
              <span className="tg-category-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Perguntas */}
        <div className="tg-section">
          <div className="tg-questions-header">
            <h2 className="tg-section-title">Perguntas ({includedTasks.length})</h2>
            <div className="tg-questions-actions">
              <button className="tg-ai-btn" onClick={() => setIsAiModalOpen(true)}>
                <SparkleIcon />
                Gerar com IA
              </button>
              <button className="tg-add-task-btn" onClick={addManualTask}>
                + Adicionar Atividade
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="tg-questions-empty">
              <p>Nenhuma pergunta adicionada</p>
              <span>Clique em "Adicionar Atividade" ou gere com IA para começar</span>
            </div>
          ) : (
            <div className="tg-questions-list">
              {tasks.map((task, index) => (
                <div
                  key={task._localId}
                  className={`tg-question-card ${!task.included ? "tg-question-card--excluded" : ""}`}
                >
                  <div className="tg-question-top">
                    <span className="tg-question-label">Pergunta {index + 1}</span>
                    {task.source === "ai" && <span className="tg-ai-badge">✦ Gerada por IA</span>}
                    <div className="tg-question-top-actions">
                      {task.source === "ai" && (
                        <label className="tg-include-label">
                          <input
                            type="checkbox"
                            checked={task.included}
                            onChange={(e) =>
                              updateTask(task._localId, "included", e.target.checked)
                            }
                          />
                          Incluir no grupo
                        </label>
                      )}
                      <button
                        className="tg-remove-task-btn"
                        onClick={() => removeTask(task._localId)}
                        title="Remover pergunta"
                      >
                        <img src={iconTrash} alt="Remover" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    className="tg-form-input"
                    placeholder="Digite o enunciado da atividade..."
                    value={task.prompt}
                    onChange={(e) => updateTask(task._localId, "prompt", e.target.value)}
                  />

                  <div className="tg-alternatives-section">
                    <label className="tg-label">
                      Alternativas (marque a correta) *
                    </label>
                    <div className="tg-alternatives-list">
                      {task.alternatives.map((alt, altIdx) => (
                        <div key={alt._localId} className="tg-alternative-row">
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
                            className="tg-form-input tg-alternative-input"
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
                            className="tg-remove-alt-btn"
                            onClick={() => removeAlternative(task._localId, alt._localId)}
                            title="Remover alternativa"
                          >
                            <img src={iconTrash} alt="Remover" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="tg-add-alt-btn"
                      onClick={() => addTaskAlternative(task._localId)}
                    >
                      + Adicionar Alternativa
                    </button>
                  </div>

                  <div className="tg-media-section">
                    <label className="tg-label">Mídia (opcional)</label>
                    <div className="tg-media-controls">
                      {task.imageFile ? (
                        <span className="tg-media-badge">
                          🖼️ Imagem anexada
                          <button
                            onClick={() => removeMedia(task._localId, "image")}
                            title="Remover imagem"
                          >
                            ×
                          </button>
                        </span>
                      ) : (
                        <label className="tg-media-upload-btn">
                          {task.uploadingMedia === "image"
                            ? "Enviando imagem..."
                            : "+ Imagem"}
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={Boolean(task.uploadingMedia)}
                            onChange={(e) => {
                              handleMediaUpload(task._localId, "image", e.target.files[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      )}
                      {task.audioFile ? (
                        <span className="tg-media-badge">
                          🎵 Áudio anexado
                          <button
                            onClick={() => removeMedia(task._localId, "audio")}
                            title="Remover áudio"
                          >
                            ×
                          </button>
                        </span>
                      ) : (
                        <label className="tg-media-upload-btn">
                          {task.uploadingMedia === "audio"
                            ? "Enviando áudio..."
                            : "+ Áudio"}
                          <input
                            type="file"
                            accept="audio/*"
                            hidden
                            disabled={Boolean(task.uploadingMedia)}
                            onChange={(e) => {
                              handleMediaUpload(task._localId, "audio", e.target.files[0]);
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

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        category={selectedCategory}
        onGenerated={addGeneratedTasks}
      />
    </div>
  );
}

export default CreateTaskGroupPage;
