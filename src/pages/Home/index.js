import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import MiniCalendar, { toDateKey } from "../../components/ui/MiniCalendar/index.js";
import iconRandom from "../../assets/images/icon_random.png";
import iconCaderno from "../../assets/images/caderneta.png";
import scheduleIcon from "../../assets/images/blue-schedule-icon.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAYS = [
  "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
  "Quinta-feira", "Sexta-feira", "Sábado",
];

const SCHEDULE_BORDER_COLORS = ["#FF8A65", "#BA68C8", "#4FC3F7", "#FFD54F"];

const ACTIVITY_CARD_COLORS = [
  { bg: "#D9F6F1", accent: "#2cc9c1" },
  { bg: "#FBE2EC", accent: "#e0479e" },
  { bg: "#FFF3D6", accent: "#e8a020" },
];

const SESSION_TAG_COLORS = [
  { bg: "#DCEBFF", color: "#3B82F6" },
  { bg: "#FBD3E5", color: "#E0479E" },
  { bg: "#DFF7EC", color: "#2EB67D" },
  { bg: "#EBDDFB", color: "#8B5CF6" },
];

const CATEGORY_MAP = {
  reading: "Leitura",
  writing: "Escrita",
  vocabulary: "Vocabulário",
  comprehension: "Compreensão",
};

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ClockIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TagIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CalendarIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

function Home() {
  const [userName, setUserName] = useState("");
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [userRes, studentsRes, appointmentsRes, notebooksRes, tasksRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/educator/me`, config),
            axios.get(`${API_BASE_URL}/student/`, config),
            axios
              .get(`${API_BASE_URL}/appointment`, config)
              .catch(() => ({ data: [] })),
            axios
              .get(`${API_BASE_URL}/task-notebook/`, config)
              .catch(() => ({ data: [] })),
            axios
              .get(`${API_BASE_URL}/task/`, config)
              .catch(() => ({ data: [] })),
          ]);

        setUserName(userRes.data?.name || "");
        setAppointments(
          Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []
        );
        setNotebooks(Array.isArray(notebooksRes.data) ? notebooksRes.data : []);
        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);

        const allStudents = Array.isArray(studentsRes.data)
          ? studentsRes.data
          : studentsRes.data?.students || [];
        setStudents(allStudents);

        // Busca as sessões dos alunos mais recentes para montar "Últimas Sessões Realizadas"
        const studentsToFetch = [...allStudents]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

        const sessionsByStudent = await Promise.all(
          studentsToFetch.map(async (student) => {
            try {
              const res = await axios.get(
                `${API_BASE_URL}/task-notebook-session/student/${student.id}`,
                config
              );
              const sessions = Array.isArray(res.data)
                ? res.data
                : res.data?.sessions || [];
              return sessions.map((session) => ({ session, student }));
            } catch (err) {
              return [];
            }
          })
        );

        const finished = sessionsByStudent
          .flat()
          .filter(({ session }) => session.finishedAt)
          .sort(
            (a, b) =>
              new Date(b.session.startedAt) - new Date(a.session.startedAt)
          )
          .slice(0, 3)
          .map(({ session, student }) => {
            const answers = session.answers || [];
            const correct = answers.filter((a) => a.isCorrect).length;
            const accuracy =
              answers.length > 0
                ? Math.round((correct / answers.length) * 100)
                : null;
            const durationMin = Math.max(
              1,
              Math.round(
                (new Date(session.finishedAt) - new Date(session.startedAt)) /
                  60000
              )
            );
            return { session, student, accuracy, durationMin };
          });

        setRecentSessions(finished);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        if (error.response && error.response.status === 401) {
          alert("Sua sessão expirou. Por favor, faça login novamente.");
          navigate("/");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate, location.state]);

  const studentsById = students.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {});

  const today = new Date();
  const activeAppointments = appointments.filter(
    (a) => a.status !== "CANCELLED"
  );
  const todayAppointments = activeAppointments
    .filter((a) => toDateKey(new Date(a.scheduledAt)) === toDateKey(today))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const markedDates = new Set(
    activeAppointments.map((a) => toDateKey(new Date(a.scheduledAt)))
  );

  const firstName = userName ? userName.split(" ")[0] : "Educador";

  // Cadernos de atividades são a fonte principal; se o educador ainda não
  // tiver cadernos, mostra as atividades avulsas para a seção não ficar vazia.
  const recentItems =
    notebooks.length > 0
      ? [...notebooks]
          .sort(
            (a, b) =>
              new Date(b.notebook?.createdAt || 0) -
              new Date(a.notebook?.createdAt || 0)
          )
          .slice(0, 3)
          .map((item) => ({
            id: item.notebook.id,
            title: item.notebook.description || "Caderno sem título",
            description:
              item.taskGroups?.length > 0
                ? `${item.taskGroups.length} grupo(s) de atividades`
                : "Nenhum grupo vinculado",
            tag: CATEGORY_MAP[item.notebook.category] || "Geral",
            onClick: () =>
              navigate("/NotebookDetails", {
                state: { notebookId: item.notebook.id },
              }),
          }))
      : [...tasks]
          .sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          )
          .slice(0, 3)
          .map((task) => ({
            id: task.id,
            title: task.prompt || "Atividade sem título",
            description: "Atividade individual",
            tag: CATEGORY_MAP[task.category] || "Geral",
            onClick: () =>
              navigate("/activityDetails", {
                state: { activityId: task.id },
              }),
          }));

  const goToAgenda = (state) => navigate("/agenda", { state });

  return (
    <div className="home-page">
      <Navbar activePage="dashboard" />

      <main className="home-content">
        <h1 className="home-title">Tela Inicial</h1>
        <p className="home-subtitle">
          {isLoading ? (
            <span className="skeleton skeleton-text" style={{ width: 240, display: "inline-block" }} />
          ) : (
            `Bem vindo(a) de volta, ${firstName}!`
          )}
        </p>

        {/* Linha 1: banner + sessões de hoje */}
        <div className="home-row">
          <div className="home-banner">
            <div className="home-banner-text">
              <h2>Olá, {isLoading ? "..." : firstName}! 👋</h2>
              <p>
                Você tem {todayAppointments.length}{" "}
                {todayAppointments.length === 1
                  ? "sessão agendada"
                  : "sessões agendadas"}{" "}
                para hoje
              </p>
            </div>
            <button
              className="home-banner-btn"
              onClick={() => navigate("/session")}
            >
              <PlayIcon /> Iniciar Sessão
            </button>
          </div>

          <div className="home-card home-sessions-today">
            <div>
              <p className="home-sessions-today-label">
                Sessões {today.getDate()} de {MONTHS[today.getMonth()]}
              </p>
              <p className="home-sessions-today-count">
                {isLoading ? "-" : todayAppointments.length}
              </p>
            </div>
            <span className="home-sessions-today-icon">📅</span>
          </div>
        </div>

        {/* Linha 2: agenda do dia + calendário */}
        <div className="home-row">
          <div className="home-card home-schedule-card">
            <div className="home-schedule-header">
              <div>
                <h3 className="home-schedule-date">
                  {String(today.getDate()).padStart(2, "0")}/
                  {String(today.getMonth() + 1).padStart(2, "0")}
                </h3>
                <p className="home-schedule-weekday">
                  {WEEKDAYS[today.getDay()]}
                </p>
              </div>
              <button
                className="home-schedule-link"
                onClick={() => goToAgenda()}
              >
                <CalendarIcon size={15} /> Ver Agenda Completa
              </button>
            </div>

            <div className="home-schedule-list">
              {isLoading ? (
                [1, 2].map((i) => (
                  <div className="home-schedule-item" key={i}>
                    <div className="skeleton skeleton-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: "55%" }} />
                      <div className="skeleton skeleton-text" style={{ width: "35%" }} />
                    </div>
                  </div>
                ))
              ) : todayAppointments.length === 0 ? (
                <p className="home-empty-text">
                  Nenhuma sessão agendada para hoje.
                </p>
              ) : (
                todayAppointments.slice(0, 4).map((appointment, index) => {
                  const student = studentsById[appointment.studentId];
                  return (
                    <div
                      className="home-schedule-item"
                      key={appointment.id}
                      style={{
                        borderLeftColor:
                          SCHEDULE_BORDER_COLORS[
                            index % SCHEDULE_BORDER_COLORS.length
                          ],
                      }}
                      onClick={() => goToAgenda()}
                    >
                      <img
                        src={student?.photoUrl || iconRandom}
                        alt=""
                        className="home-schedule-avatar"
                        onError={(e) => {
                          e.currentTarget.src = iconRandom;
                        }}
                      />
                      <div className="home-schedule-info">
                        <h4>{student?.name || "Aluno"}</h4>
                        <span>
                          <ClockIcon /> {formatTime(appointment.scheduledAt)}
                        </span>
                        <span>
                          <TagIcon />{" "}
                          {appointment.observation || "Sessão agendada"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="home-card home-agenda-card">
            <div className="home-agenda-header">
              <h3>Agenda</h3>
              <button
                className="home-agenda-add-btn"
                title="Novo agendamento"
                onClick={() => goToAgenda({ openNew: true })}
              >
                +
              </button>
            </div>
            <MiniCalendar
              selectedDate={null}
              markedDates={markedDates}
              onSelectDate={(date) =>
                goToAgenda({ selectedDate: date.toISOString() })
              }
            />
          </div>
        </div>

        {/* Linha 3: atividades recentes + últimas sessões */}
        <div className="home-row">
          <div className="home-card home-activities-card">
            <div className="home-card-header">
              <h3>Atividades Recentes</h3>
              <button
                className="home-see-all"
                onClick={() => navigate("/activitiesMain")}
              >
                Ver todas →
              </button>
            </div>

            <div className="home-activities-grid">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div className="skeleton home-activity-skeleton" key={i} />
                ))
              ) : recentItems.length === 0 ? (
                <p className="home-empty-text">
                  Nenhuma atividade encontrada. Crie cadernos e atividades na
                  aba Atividades.
                </p>
              ) : (
                recentItems.map((item, index) => {
                  const colors =
                    ACTIVITY_CARD_COLORS[index % ACTIVITY_CARD_COLORS.length];
                  return (
                    <div
                      className="home-activity-mini-card"
                      key={item.id}
                      style={{ backgroundColor: colors.bg }}
                      onClick={item.onClick}
                    >
                      <span className="home-activity-icon-box">
                        <img src={iconCaderno} alt="" />
                      </span>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      <div className="home-activity-tags">
                        <span
                          className="home-activity-tag"
                          style={{ color: colors.accent }}
                        >
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="home-card home-last-sessions-card">
            <div className="home-card-header">
              <h3>Últimas Sessões Realizadas</h3>
              <button
                className="home-see-all"
                onClick={() => navigate("/MainReport")}
              >
                Ver todas →
              </button>
            </div>

            <div className="home-last-sessions-list">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div className="home-last-session-item" key={i}>
                    <div className="skeleton skeleton-avatar" />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: "55%" }} />
                      <div className="skeleton skeleton-text" style={{ width: "70%" }} />
                    </div>
                  </div>
                ))
              ) : recentSessions.length === 0 ? (
                <p className="home-empty-text">
                  Nenhuma sessão realizada ainda.
                </p>
              ) : (
                recentSessions.map(
                  ({ session, student, accuracy, durationMin }, index) => {
                    const tagColors =
                      SESSION_TAG_COLORS[index % SESSION_TAG_COLORS.length];
                    return (
                      <div
                        className="home-last-session-item"
                        key={session.id || session.sessionId}
                        onClick={() =>
                          navigate("/ReportSession", {
                            state: {
                              sessionId: session.sessionId || session.id,
                            },
                          })
                        }
                      >
                        <img
                          src={student.photoUrl || iconRandom}
                          alt=""
                          className="home-last-session-avatar"
                          onError={(e) => {
                            e.currentTarget.src = iconRandom;
                          }}
                        />
                        <div className="home-last-session-info">
                          <h4>{student.name}</h4>
                          <div className="home-last-session-meta">
                            <span>
                              <img src={scheduleIcon} alt="" />
                              {new Date(
                                session.startedAt
                              ).toLocaleDateString("pt-BR")}
                            </span>
                            <span>
                              <ClockIcon />
                              {formatTime(session.startedAt)} • {durationMin}
                              min
                            </span>
                            <span
                              className="home-last-session-tag"
                              style={{
                                backgroundColor: tagColors.bg,
                                color: tagColors.color,
                              }}
                            >
                              {session.name ||
                                session.sessionName ||
                                "Sessão"}
                            </span>
                          </div>
                        </div>
                        <div className="home-last-session-score">
                          <span className="home-score-label">
                            Taxa de Acerto
                          </span>
                          <span className="home-score-value">
                            {accuracy !== null ? `${accuracy}%` : "—"}
                          </span>
                        </div>
                        <span className="home-last-session-chevron">›</span>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
