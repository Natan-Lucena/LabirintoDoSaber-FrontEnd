import React, { useState, useEffect } from "react";
import "./style.css";
import Navbar from "../../components/ui/NavBar/index.js";
import iconArrowLeft from "../../assets/images/seta_icon_esquerda.png";
import patientAvatar from "../../assets/images/icon_random.png";
import iconSeta from "../../assets/images/seta_icon.png";
import SearchBar from "../../components/ui/SearchBar/Search";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageTurner from "../../components/ui/PageTurner/index.js";

function MainReport() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const patientsPerPage = 3;

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const educatorId = localStorage.getItem("userId");
                const token = localStorage.getItem("authToken");

                if (!educatorId || !token) {
                    navigate("/");
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const response = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/student/`,
                    config
                );

                let allStudents = [];

                if (Array.isArray(response.data)) {
                    allStudents = response.data;
                } else if (response.data && Array.isArray(response.data.students)) {
                    allStudents = response.data.students;
                }

                const myStudents = allStudents.filter(
                    (s) => String(s.educatorId) === String(educatorId)
                );

                const mappedPatients = myStudents.map((s) => ({
                    id: s.id,
                    name: s.name,
                    age: s.age,
                    photoUrl: s.photoUrl,
                    status: s.learningTopics?.[0] || "Sem tópico definido"
                }));

                setPatients(mappedPatients);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar estudantes:", error);
                setLoading(false);
            }
        };

        fetchStudents();
    }, [navigate]);

    const handlePatientClick = (patientId) => {
        navigate("/ReportPacient", { state: { patientId } });
    };

    const filteredPatients = patients.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
    const startIndex = (currentPage - 1) * patientsPerPage;
    const currentPatients = filteredPatients.slice(
        startIndex,
        startIndex + patientsPerPage
    );

    const changePage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    return (
        <div className="dashboard-container">
            <Navbar />

            <main className="session-main-content">
                <div className="session-container">
                    <div className="session-header-top">
                        <h1>Relatórios</h1>

                        <div className="search-filter-group">
                            <SearchBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                placeholder="Selecione o paciente..."
                            />
                        </div>
                    </div>

                    <div className="select-patient">
                        <h2 className="session-subtitle">Pacientes</h2>

                        {loading ? (
                            <p>Carregando...</p>
                        ) : (
                            <div className="patient-card-list">
                                {currentPatients.map((patient) => (
                                    <div
                                        key={patient.id}
                                        className="patient-list-item-card"
                                        onClick={() => handlePatientClick(patient.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                    <img
                                    src={patient.photoUrl || patientAvatar}
                                    alt={`Avatar de ${patient.name}`}
                                    className="patient-avatar"
                                    onError={(e) => {
                                        e.currentTarget.src = patientAvatar;
                                    }}
                                    />
                                        <div className="patient-card-info">
                                            <h3>{patient.name}</h3>
                                            <p>{patient.age} anos</p>
                                            <p className="patient-status">{patient.status}</p>
                                        </div>

                                        <div className="patient-card-action">
                                            <img src={iconSeta} alt="Avançar" className="seta" />
                                        </div>
                                    </div>
                                ))}

                                {currentPatients.length === 0 && (
                                    <p>Nenhum paciente encontrado.</p>
                                )}
                            </div>
                        )}

                        <PageTurner
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={changePage}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default MainReport;
