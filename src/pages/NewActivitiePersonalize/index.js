import React, { useState, useRef } from 'react';
import axios from 'axios';
import './style.css';
import logo from '../../assets/images/logo.png';
import iconNotification from '../../assets/images/icon_notification.png';
import iconProfile from '../../assets/images/icon_profile.png';
import iconBack from '../../assets/images/seta_icon_esquerda.png'; // Importando seta de voltar
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import iconAdd from "../../assets/images/add.png";
import iconTrash from "../../assets/images/trash.png";
import iconEyeClosed from "../../assets/images/eye-closed.png";
import play from "../../assets/images/video.png";
import Navbar from "../../components/ui/NavBar/index.js";


/** Campo de arquivo com UI customizada e lógica de seleção */
const FileField = ({ id, label, accept, helper, suffixIcon, onFileSelect }) => {
  const [fileName, setFileName] = useState('Nenhum arquivo foi selecionado');
  const inputRef = useRef(null);

  const onChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFileName(f ? f.name : 'Nenhum arquivo foi selecionado');
    if (onFileSelect) onFileSelect(f); // Passa o arquivo para o pai
  };

  return (
    <div className="form-group file-group">
      <label className="form-label required" htmlFor={id}>{label}</label>

      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="file-input-hidden"
        onChange={onChange}
        style={{ display: 'none' }} 
      />

      <div className="file-row">
        <label htmlFor={id} className="file-ui">
          <span className="file-trigger">
            {/* Ícone de upload */}
            <svg className="file-trigger-icon" viewBox="0 0 21 13" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.4199 5.52539L16.9265 5.60601L16.9871 5.9772L17.3606 6.02185L17.4199 5.52539ZM6.21094 3.66602L6.07665 4.14765L6.46214 4.25512L6.65145 3.90255L6.21094 3.66602ZM11.5 0.5V1C14.2327 1 16.4996 2.99367 16.9265 5.60601L17.4199 5.52539L17.9134 5.44477C17.4089 2.35693 14.7309 0 11.5 0V0.5ZM17.4199 5.52539L17.3606 6.02185C18.8473 6.19964 20 7.46543 20 9H20.5H21C21 6.95284 19.4626 5.2661 17.4793 5.02893L17.4199 5.52539ZM20.5 9H20C20 10.6569 18.6569 12 17 12V12.5V13C19.2091 13 21 11.2091 21 9H20.5ZM17 12.5V12H5V12.5V13H17V12.5ZM5 12.5V12C2.79086 12 1 10.2091 1 8H0.5H0C0 10.7614 2.23858 13 5 13V12.5ZM0.5 8H1C1 5.79086 2.79086 4 5 4V3.5V3C2.23858 3 0 5.23858 0 8H0.5ZM5 3.5V4C5.37288 4 5.73365 4.05201 6.07665 4.14765L6.21094 3.66602L6.34522 3.18439C5.91747 3.06512 5.46641 3 5 3V3.5ZM6.21094 3.66602L6.65145 3.90255C7.57968 2.17383 9.40294 1 11.5 1V0.5V0C9.01992 0 6.86581 1.38945 5.77042 3.42948L6.21094 3.66602Z" fill="currentColor"/>
            </svg>
            Selecionar arquivo
          </span>
          <span className="file-placeholder">{fileName}</span>
        </label>

        <button type="button" className="file-suffix" aria-label="Mais opções">
          {suffixIcon}
        </button>
      </div>

      {helper && <small className="helper-text">{helper}</small>}
    </div>
  );
};

export default function AdicionarAtividadePersonalize() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Recebe dados da tela anterior
  const defaultSchema = 'Enunciado e alternativas';
  const selectedSchema = location.state?.selectedSchema || defaultSchema;
  
  // Mapeia Categoria
  const categoryMap = {
      'Leitura': 'reading',
      'Escrita': 'writing',
      'Vocabulário': 'vocabulary',
      'Compreensão': 'comprehension'
  };
  const selectedCategoryLabel = location.state?.selectedCategory || 'Leitura';
  const categoryApiValue = categoryMap[selectedCategoryLabel] || 'reading';
    
  // Controle visual
  const showImageField = selectedSchema.includes('Imagem');
  const showAudioField = selectedSchema.includes('Áudio');

  // Estados dos dados
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [alternativas, setAlternativas] = useState([{ id: crypto.randomUUID(), texto: '' }]);
  const [correctAltId, setCorrectAltId] = useState(null);

  // Manipulação de alternativas
  const addAlt = () => setAlternativas((prev) => [...prev, { id: crypto.randomUUID(), texto: '' }]);
  const removeAlt = (id) => setAlternativas((prev) => {
    if (prev.length <= 1) return prev;
    if (correctAltId === id) setCorrectAltId(null);
    return prev.filter(a => a.id !== id);
  });
  const updateAlt = (id, v) => setAlternativas((prev) => prev.map(a => a.id === id ? { ...a, texto: v } : a));

  // Função auxiliar para definir o tipo da API
  const determineTypeFromSchema = (schema) => {
      if (schema && (schema.includes('Imagem') || schema.includes('Áudio'))) {
          return "multipleChoiceWithMedia"; 
      }
      return "multipleChoice"; 
  };

  // --- SUBMIT PARA API (INTEGRAÇÃO FEITA AQUI) ---
  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken');

    if (!prompt.trim()) return alert("Preencha o enunciado.");
    if (alternativas.some(a => !a.texto.trim())) return alert("Preencha todas as alternativas.");
    if (!correctAltId) return alert("Selecione qual alternativa é a correta.");

    const formattedAlternatives = alternativas.map(alt => ({
        text: alt.texto,
        isCorrect: alt.id === correctAltId
    }));

    const formData = new FormData();
    formData.append("category", categoryApiValue);
    formData.append("type", determineTypeFromSchema(selectedSchema));
    formData.append("prompt", prompt);
    formData.append("alternatives", JSON.stringify(formattedAlternatives));

    if (showImageField && imageFile) formData.append("imageFile", imageFile);
    if (showAudioField && audioFile) formData.append("audioFile", audioFile);

    try {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/task/create`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        alert('Atividade criada com sucesso!');
        navigate('/activitiesMain');
    } catch (error) {
        console.error(error);
        alert('Erro ao criar atividade.');
    }
  };

  return (
    <div className="dashboard-container">
     <Navbar activePage="activities" />

      <main className="main-content">
        <button className="back-button" onClick={() => navigate(-1)} style={{border:'none', background:'none', cursor:'pointer'}}>
            <img src={iconBack} alt="Voltar" className="seta" />
        </button>

        <form className="adicionar-atividade-container" onSubmit={handleCreate}>
            <h1 className="form-title">Personalize a sua atividade</h1>
            <p style={{marginBottom: '20px', color: '#666', fontSize: '0.9em'}}>
                Esquema: <strong>{selectedSchema}</strong>
            </p>
            <hr className="title-separator" />

            {/* Renderização Condicional de Imagem */}
            {showImageField && (
                <FileField
                    id="imgAssoc"
                    label="Imagem para associação"
                    accept="image/png,image/jpeg"
                    helper="Formatos aceitos: JPG, PNG."
                    onFileSelect={setImageFile}
                    suffixIcon={
                    <img 
                      src={iconEyeClosed} 
                      alt="Mostrar" 
                      style={{ width: "18px", height: "18px" }}
                    />
                  }

                />
            )}

            {/* Renderização Condicional de Áudio */}
            {showAudioField && (
                <FileField
                    id="audioAssoc"
                    label="Áudio para associação"
                    accept=".mp3,.wav,audio/*"
                    helper="Formatos aceitos: MP3, WAV."
                    onFileSelect={setAudioFile}
                    suffixIcon={
                    <img 
                      src={play} 
                      alt="Mostrar" 
                      style={{ width: "18px", height: "18px" }}
                    />
                  }
                />
            )}

            <div className="form-group">
                <label className="form-label required" htmlFor="enunciado">Enunciado da atividade</label>
                <input
                    id="enunciado"
                    className="text-input"
                    type="text"
                    placeholder="Preencha aqui..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>

            <div className="form-group">
                <div className="form-label required">Alternativas</div>
                <div className="alternativas-list">
                    {alternativas.map((alt, idx) => (
                        <div key={alt.id} className="alternativa-row" style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
                            <input 
                                type="radio" 
                                name="correta" 
                                className="radio-outside" 
                                checked={correctAltId === alt.id} 
                                onChange={() => setCorrectAltId(alt.id)}
                            />
                            <div className="alternativa-item" style={{flex:1}}>
                                <input
                                    className="alternativa-input"
                                    placeholder={`Alternativa ${idx + 1}`}
                                    value={alt.texto}
                                    onChange={(e) => updateAlt(alt.id, e.target.value)}
                                />
                            </div>
                            <button 
                            type="button" 
                            className="alt-remove-outside" 
                            onClick={() => removeAlt(alt.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '5px'
                            }}
                          >
                            <img 
                              src={iconTrash} 
                              alt="Remover alternativa" 
                              style={{ width: '16px', height: '16px' }}
                            />
                          </button>

                        </div>
                    ))}
                </div>
                <button 
  type="button" 
  className="alt-add" 
  onClick={addAlt} 
  style={{
    background: 'none', 
    border: 'none', 
    color: '#000', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  }}
>
  <img 
    src={iconAdd} 
    alt="Adicionar" 
    style={{ width: '30px', height: '30px', marginTop: '5px' }}
  />
  Adicionar alternativa
</button>

            </div>

            <div className="next-button-container">
                <button className="button-next" type="submit">Salvar Atividade</button>
            </div>
        </form>
      </main>
    </div>
  );
}