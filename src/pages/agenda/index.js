import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import MiniCalendar, { toDateKey } from "../../components/ui/MiniCalendar/index.js";
import backIcon from "../../assets/images/back-button.png";
import scheduleIcon from "../../assets/images/blue-schedule-icon.png";
import iconRandom from "../../assets/images/icon_random.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const WEEKDAYS = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado",
];

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a, b) {
  return toDateKey(a) === toDateKey(b);
}

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const RescheduleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function AppointmentModal({ mode, appointment, students, defaultDate, onClose, onSaved }) {
  const isReschedule = mode === "reschedule";
  const isEdit = mode === "edit";

  const initialDate = appointment
    ? toDateKey(new Date(appointment.scheduledAt))
    : toDateKey(defaultDate || new Date());
  const initialTime = appointment ? formatTime(appointment.scheduledAt) : "";

  const [studentId, setStudentId] = useState(appointment?.studentId || "");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [observation, setObservation] = useState(appointment?.observation || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const titles = {
    create: "Novo Agendamento",
    edit: "Editar Agendamento",
    reschedule: "Remarcar Agendamento",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEdit && !isReschedule && !studentId) {
      setError("Selecione um aluno.");
      return;
    }
    if (!date || !time) {
      setError("Informe a data e o horário.");
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (mode === "create") {
        const body = { studentId, scheduledAt };
        if (observation.trim()) body.observation = observation.trim();
        await axios.post(`${API_BASE_URL}/appointment`, body, config);
      } else if (mode === "edit") {
        await axios.put(
          `${API_BASE_URL}/appointment/${appointment.id}`,
          { scheduledAt, observation: observation.trim() || null },
          config
        );
      } else {
        await axios.put(
          `${API_BASE_URL}/appointment/${appointment.id}`,
          { scheduledAt },
          config
        );
      }
      onSaved();
    } catch (err) {
      console.error("Erro ao salvar agendamento:", err);
      setError("Erro ao salvar o agendamento. Tente novamente.");
      setSaving(false);
    }
  };

  return (
    <div className="agenda-modal-overlay" onClick={onClose}>
      <div className="agenda-modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="agenda-modal-title">{titles[mode]}</h2>

        <form onSubmit={handleSubmit}>
          {!isReschedule && (
            <div className="agenda-field">
              <label className="agenda-field-label">Aluno</label>
              <select
                className="agenda-field-input"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                disabled={isEdit}
              >
                <option value="">Selecione o aluno...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="agenda-field-row">
            <div className="agenda-field">
              <label className="agenda-field-label">Data</label>
              <input
                type="date"
                className="agenda-field-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="agenda-field">
              <label className="agenda-field-label">Horário</label>
              <input
                type="time"
                className="agenda-field-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {!isReschedule && (
            <div className="agenda-field">
              <label className="agenda-field-label">Observação (opcional)</label>
              <textarea
                className="agenda-field-input agenda-field-textarea"
                placeholder="Ex: Trazer caderno de exercícios"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {error && <p className="agenda-modal-error">{error}</p>}

          <div className="agenda-modal-actions">
            <button type="button" className="agenda-modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="agenda-modal-save" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ target, onClose, onConfirm }) {
  if (!target) return null;
  return (
    <div className="agenda-modal-overlay" onClick={onClose}>
      <div className="agenda-modal-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="agenda-modal-title">Excluir Agendamento</h2>
        <p className="agenda-modal-desc">
          Tem certeza que deseja excluir o agendamento de "{target.studentName}"?
          Esta ação não pode ser desfeita.
        </p>
        <div className="agenda-modal-actions">
          <button className="agenda-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="agenda-modal-delete" onClick={onConfirm}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

function AgendaPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() =>
    location.state?.selectedDate ? new Date(location.state.selectedDate) : new Date()
  );
  const [modal, setModal] = useState(() =>
    location.state?.openNew ? { mode: "create" } : null
  );
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [appointmentsRes, studentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointment`, config),
        axios.get(`${API_BASE_URL}/student/`, config),
      ]);

      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      const allStudents = Array.isArray(studentsRes.data)
        ? studentsRes.data
        : studentsRes.data?.students || [];
      setStudents(allStudents);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
      if (error.response?.status === 401) navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const studentsById = students.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const activeAppointments = appointments.filter((a) => a.status !== "CANCELLED");

  const markedDates = new Set(
    activeAppointments.map((a) => toDateKey(new Date(a.scheduledAt)))
  );

  const dayAppointments = activeAppointments
    .filter((a) => isSameDay(new Date(a.scheduledAt), selectedDate))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

  const isToday = isSameDay(selectedDate, new Date());
  const headerTitle = isToday
    ? "Sessões de Hoje"
    : `Sessões de ${selectedDate.getDate().toString().padStart(2, "0")} de ${MONTHS[selectedDate.getMonth()]}`;
  const headerSubtitle = `${WEEKDAYS[selectedDate.getDay()]}, ${selectedDate
    .getDate()
    .toString()
    .padStart(2, "0")} de ${MONTHS[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`;

  const firstSession = dayAppointments[0];
  const lastSession = dayAppointments[dayAppointments.length - 1];

  const handleSaved = () => {
    setModal(null);
    fetchData();
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_BASE_URL}/appointment/${deleteTarget.id}`, config);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="agenda-page">
      <Navbar activePage="dashboard" />

      <div className="agenda-content">
        <div className="agenda-title-row">
          <button className="agenda-back-btn" onClick={() => navigate("/home")}>
            <img src={backIcon} alt="Voltar" />
          </button>
          <h1 className="agenda-title">Agenda de Atendimentos</h1>
        </div>

        <div className="agenda-layout">
          {/* Coluna esquerda */}
          <aside className="agenda-sidebar">
            <div className="agenda-card agenda-calendar-card">
              <MiniCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                markedDates={markedDates}
              />
            </div>

            <button
              className="agenda-new-btn"
              onClick={() => setModal({ mode: "create" })}
            >
              + Novo Agendamento
            </button>

            <div className="agenda-card agenda-summary-card">
              <p className="agenda-summary-title">📊 Resumo do Dia</p>
              <div className="agenda-summary-row">
                <span>Total de Sessões</span>
                <strong className="agenda-summary-total">{dayAppointments.length}</strong>
              </div>
              {dayAppointments.length > 0 && (
                <>
                  <div className="agenda-summary-row">
                    <span>Primeira Sessão</span>
                    <strong>{formatTime(firstSession.scheduledAt)}</strong>
                  </div>
                  <div className="agenda-summary-row">
                    <span>Última Sessão</span>
                    <strong>{formatTime(lastSession.scheduledAt)}</strong>
                  </div>
                </>
              )}
            </div>
          </aside>

          {/* Coluna direita */}
          <section className="agenda-main">
            <div className="agenda-card agenda-day-header">
              <div>
                <h2 className="agenda-day-title">{headerTitle}</h2>
                <p className="agenda-day-subtitle">{headerSubtitle}</p>
              </div>
              <span className="agenda-day-count">
                <img src={scheduleIcon} alt="" />
                {dayAppointments.length}
              </span>
            </div>

            {loading ? (
              <div className="agenda-card agenda-empty-card">
                <p className="agenda-loading-text">Carregando agendamentos...</p>
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="agenda-card agenda-empty-card">
                <span className="agenda-empty-icon">
                  <img src={scheduleIcon} alt="" />
                </span>
                <p className="agenda-empty-title">Nenhuma sessão agendada</p>
                <p className="agenda-empty-sub">
                  Você não tem sessões agendadas para{" "}
                  {selectedDate.toLocaleDateString("pt-BR")}
                </p>
                <button
                  className="agenda-empty-create-btn"
                  onClick={() => setModal({ mode: "create" })}
                >
                  Criar Agendamento
                </button>
              </div>
            ) : (
              <div className="agenda-session-list">
                {dayAppointments.map((appointment) => {
                  const student = studentsById[appointment.studentId];
                  const studentName = student?.name || "Aluno";
                  const isCompleted = appointment.status === "COMPLETED";
                  return (
                    <div className="agenda-card agenda-session-card" key={appointment.id}>
                      <div className="agenda-session-time">
                        <ClockIcon />
                        <span>{formatTime(appointment.scheduledAt)}</span>
                      </div>

                      <img
                        src={student?.photoUrl || iconRandom}
                        alt={studentName}
                        className="agenda-session-avatar"
                        onError={(e) => {
                          e.currentTarget.src = iconRandom;
                        }}
                      />

                      <div className="agenda-session-info">
                        <h3>{studentName}</h3>
                        <p>{appointment.observation || "Sessão agendada"}</p>
                      </div>

                      {isCompleted ? (
                        <span className="agenda-status-done">
                          <CheckIcon /> Realizada
                        </span>
                      ) : (
                        <div className="agenda-session-actions">
                          <button
                            className="agenda-action-btn agenda-action-edit"
                            onClick={() => setModal({ mode: "edit", appointment })}
                          >
                            <EditIcon /> Editar
                          </button>
                          <button
                            className="agenda-action-btn agenda-action-reschedule"
                            onClick={() => setModal({ mode: "reschedule", appointment })}
                          >
                            <RescheduleIcon /> Remarcar
                          </button>
                          <button
                            className="agenda-action-btn agenda-action-delete"
                            onClick={() =>
                              setDeleteTarget({ id: appointment.id, studentName })
                            }
                          >
                            <TrashIcon /> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {modal && (
        <AppointmentModal
          mode={modal.mode}
          appointment={modal.appointment}
          students={students}
          defaultDate={selectedDate}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      <DeleteModal
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default AgendaPage;
