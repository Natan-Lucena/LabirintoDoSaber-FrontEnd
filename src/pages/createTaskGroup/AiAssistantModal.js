import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 15;

const SparkleIcon = ({ color = "#fff" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3L13.8 8.2L19 10L13.8 11.8L12 17L10.2 11.8L5 10L10.2 8.2L12 3Z"
      fill={color}
    />
    <path d="M19 15L19.9 17.1L22 18L19.9 18.9L19 21L18.1 18.9L16 18L18.1 17.1L19 15Z" fill={color} />
  </svg>
);

function AiAssistantModal({ isOpen, onClose, category, onGenerated }) {
  const [quantity, setQuantity] = useState(3);
  const [targetAudience, setTargetAudience] = useState("");
  const [instructions, setInstructions] = useState("");
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const changeQuantity = (delta) => {
    setQuantity((prev) => Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, prev + delta)));
  };

  const handleGenerate = async () => {
    setErrorMsg("");
    if (!targetAudience.trim()) {
      setErrorMsg("Descreva o público-alvo / perfil do paciente.");
      return;
    }
    if (!instructions.trim()) {
      setErrorMsg("Descreva as instruções para a IA.");
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const payload = {
        targetAudience: targetAudience.trim(),
        instructions: instructions.trim(),
        quantity,
        category,
      };
      const { data } = await axios.post(`${API_BASE_URL}/ai-task/generate`, payload, config);
      const tasks = Array.isArray(data?.tasks) ? data.tasks : [];
      if (tasks.length === 0) {
        setErrorMsg("A IA não retornou nenhuma atividade. Tente novamente.");
        return;
      }
      onGenerated(tasks);
      setTargetAudience("");
      setInstructions("");
      onClose();
    } catch (error) {
      console.error("Erro ao gerar atividades com IA:", error);
      const message = error.response?.data?.message;
      if (message === "INVALID_QUANTITY") {
        setErrorMsg(`A quantidade deve ser entre ${MIN_QUANTITY} e ${MAX_QUANTITY}.`);
      } else if (message === "AI_GENERATION_FAILED" || message === "AI_INVALID_OUTPUT") {
        setErrorMsg("A IA não conseguiu gerar as atividades. Tente novamente.");
      } else if (error.response?.status === 401) {
        setErrorMsg("Sessão expirada. Faça login novamente.");
      } else {
        setErrorMsg("Erro ao gerar as atividades. Tente novamente.");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="tg-modal-overlay" onClick={generating ? undefined : onClose}>
      <div className="tg-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="tg-modal-header">
          <span className="tg-modal-icon">
            <SparkleIcon />
          </span>
          <div className="tg-modal-header-text">
            <h2>Assistente de IA</h2>
            <p>Geração baseada no seu material</p>
          </div>
          <button
            className="tg-modal-close"
            onClick={onClose}
            disabled={generating}
            title="Fechar"
          >
            ×
          </button>
        </div>

        {errorMsg && <div className="tg-form-error">{errorMsg}</div>}

        <label className="tg-modal-label">Quantidade de Perguntas</label>
        <div className="tg-stepper">
          <button
            className="tg-stepper-btn"
            onClick={() => changeQuantity(-1)}
            disabled={quantity <= MIN_QUANTITY || generating}
          >
            −
          </button>
          <span className="tg-stepper-value">{quantity}</span>
          <button
            className="tg-stepper-btn"
            onClick={() => changeQuantity(1)}
            disabled={quantity >= MAX_QUANTITY || generating}
          >
            +
          </button>
        </div>

        <label className="tg-modal-label">Público-alvo / Perfil do Paciente</label>
        <input
          type="text"
          className="tg-form-input"
          placeholder="Ex: Criança de 7 anos com TDAH e dificuldades na fonética da letra R"
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          disabled={generating}
        />

        <label className="tg-modal-label">Instruções para a IA</label>
        <textarea
          className="tg-form-textarea"
          placeholder="Ex: Gere questões curtas de rima, com vocabulário simples e foco lúdico em animais..."
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          disabled={generating}
        />

        <button className="tg-modal-generate-btn" onClick={handleGenerate} disabled={generating}>
          <SparkleIcon />
          {generating ? "Formulando questões..." : "Formular Questões"}
        </button>
      </div>
    </div>
  );
}

export default AiAssistantModal;
