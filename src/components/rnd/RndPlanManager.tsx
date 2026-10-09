'use client';

import { useState, useEffect } from 'react';
import styles from './RndPlanManager.module.css';

interface MyFile {
    id: number;
    name: string;
    data: string; // Base64
}

interface RndSubStage {
    id: number;
    title: string;
    files: MyFile[];
}

interface RndStage {
    id: number;
    title: string;
    subStages: RndSubStage[];
    files: MyFile[];
}

interface RndProject {
    id: number;
    title: string;
    status: 'planned' | 'in-progress' | 'completed';
    stages: RndStage[];
    files: MyFile[];
}

interface RndPlanManagerProps {
    isAdmin?: boolean;
}

export default function RndPlanManager({ isAdmin = false }: RndPlanManagerProps) {
    const [projects, setProjects] = useState<RndProject[]>([]);
    const [expandedProjects, setExpandedProjects] = useState<Record<number, boolean>>({});
    const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const stored = localStorage.getItem('innovation_rnd_plan');
        if (stored) {
            setProjects(JSON.parse(stored));
        }
    }, []);

    const saveProjects = (updatedProjects: RndProject[]) => {
        setProjects(updatedProjects);
        localStorage.setItem('innovation_rnd_plan', JSON.stringify(updatedProjects));
    };

    const addProject = () => {
        const newProject: RndProject = {
            id: Date.now(),
            title: 'Новый НИОКР',
            status: 'planned',
            stages: [],
            files: []
        };
        saveProjects([...projects, newProject]);
    };

    const deleteProject = (id: number) => {
        if (confirm('Удалить этот НИОКР?')) {
            saveProjects(projects.filter(p => p.id !== id));
        }
    };

    const addStage = (projectId: number) => {
        const updated = projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    stages: [...p.stages, { id: Date.now(), title: 'Новый этап', subStages: [], files: [] }]
                };
            }
            return p;
        });
        saveProjects(updated);
    };

    const addSubStage = (projectId: number, stageId: number) => {
        const updated = projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    stages: p.stages.map(s => {
                        if (s.id === stageId) {
                            return { ...s, subStages: [...s.subStages, { id: Date.now(), title: 'Новый подэтап', files: [] }] };
                        }
                        return s;
                    })
                };
            }
            return p;
        });
        saveProjects(updated);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, projectId: number, stageId?: number, subStageId?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (re) => {
            const newFile: MyFile = {
                id: Date.now(),
                name: file.name,
                data: re.target?.result as string
            };

            const updated = projects.map(p => {
                if (p.id === projectId) {
                    if (stageId === undefined) {
                        return { ...p, files: [...p.files, newFile] };
                    }
                    return {
                        ...p,
                        stages: p.stages.map(s => {
                            if (s.id === stageId) {
                                if (subStageId === undefined) {
                                    return { ...s, files: [...s.files, newFile] };
                                }
                                return {
                                    ...s,
                                    subStages: s.subStages.map(ss => {
                                        if (ss.id === subStageId) {
                                            return { ...ss, files: [...ss.files, newFile] };
                                        }
                                        return ss;
                                    })
                                };
                            }
                            return s;
                        })
                    };
                }
                return p;
            });
            saveProjects(updated);
        };
        reader.readAsDataURL(file);
    };

    const downloadFile = (file: MyFile) => {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        link.click();
    };

    const toggleProject = (id: number) => {
        setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleStage = (id: number) => {
        setExpandedStages(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const updateTitle = (projectId: number, title: string, stageId?: number, subStageId?: number) => {
        const updated = projects.map(p => {
            if (p.id === projectId) {
                if (stageId === undefined) return { ...p, title };
                return {
                    ...p,
                    stages: p.stages.map(s => {
                        if (s.id === stageId) {
                            if (subStageId === undefined) return { ...s, title };
                            return {
                                ...s,
                                subStages: s.subStages.map(ss => ss.id === subStageId ? { ...ss, title } : ss)
                            };
                        }
                        return s;
                    })
                };
            }
            return p;
        });
        saveProjects(updated);
    };

    const changeStatus = (projectId: number, status: RndProject['status']) => {
        const updated = projects.map(p => p.id === projectId ? { ...p, status } : p);
        saveProjects(updated);
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'planned': return 'Планируется';
            case 'in-progress': return 'Выполняется';
            case 'completed': return 'Выполнено';
            default: return status;
        }
    };

    const deleteStage = (projectId: number, stageId: number) => {
        if (!confirm('Удалить этот этап?')) return;
        const updated = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, stages: p.stages.filter(s => s.id !== stageId) };
            }
            return p;
        });
        saveProjects(updated);
    };

    const deleteSubStage = (projectId: number, stageId: number, subStageId: number) => {
        if (!confirm('Удалить этот подэтап?')) return;
        const updated = projects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    stages: p.stages.map(s => {
                        if (s.id === stageId) {
                            return { ...s, subStages: s.subStages.filter(ss => ss.id !== subStageId) };
                        }
                        return s;
                    })
                };
            }
            return p;
        });
        saveProjects(updated);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>План выполнения НИОКР</h2>
                {isAdmin && (
                    <button className={styles.addBtn} onClick={addProject}>➕ Добавить НИОКР</button>
                )}
            </div>

            <div className={styles.projectsList}>
                {projects.map(project => (
                    <div key={project.id} className={styles.projectCard}>
                        <div className={styles.projectHeader}>
                            <div className={styles.projectUpper}>
                                {isAdmin ? (
                                    <input 
                                        className={styles.titleInput}
                                        value={project.title}
                                        onChange={e => updateTitle(project.id, e.target.value)}
                                    />
                                ) : (
                                    <h3 onClick={() => toggleProject(project.id)} style={{ cursor: 'pointer' }}>
                                        {project.title} {expandedProjects[project.id] ? '▴' : '▾'}
                                    </h3>
                                )}
                                <div className={styles.statusBadge} data-status={project.status}>
                                    {getStatusLabel(project.status)}
                                </div>
                            </div>
                            
                            {isAdmin && (
                                <div className={styles.adminControls}>
                                    <select 
                                        value={project.status} 
                                        onChange={e => changeStatus(project.id, e.target.value as any)}
                                    >
                                        <option value="planned">Планируется</option>
                                        <option value="in-progress">Выполняется</option>
                                        <option value="completed">Выполнено</option>
                                    </select>
                                    <button className={styles.deleteBtn} onClick={() => deleteProject(project.id)}>🗑️</button>
                                    <button className={styles.toggleBtn} onClick={() => toggleProject(project.id)}>
                                        {expandedProjects[project.id] ? 'Свернуть' : 'Развернуть'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {expandedProjects[project.id] && (
                            <div className={styles.projectDetails}>
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h4>Файлы НИОКР</h4>
                                        {isAdmin && (
                                            <div className={styles.fileUpload}>
                                                <button className={styles.smallAddBtn}>Добавить файл</button>
                                                <input type="file" onChange={e => handleFileUpload(e, project.id)} />
                                            </div>
                                        )}
                                    </div>
                                    <ul className={styles.fileList}>
                                        {project.files.map(f => (
                                            <li key={f.id} onClick={() => downloadFile(f)}>📄 {f.name}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h4>Дорожная карта (Этапы)</h4>
                                        {isAdmin && (
                                            <button className={styles.smallAddBtn} onClick={() => addStage(project.id)}>➕ Добавить этап</button>
                                        )}
                                    </div>
                                    <div className={styles.stagesList}>
                                        {project.stages.map((stage, sidx) => (
                                            <div key={stage.id} className={styles.stageItem}>
                                                <div className={styles.stageHeader}>
                                                    {isAdmin ? (
                                                        <input 
                                                            className={styles.stageInput}
                                                            value={stage.title}
                                                            onChange={e => updateTitle(project.id, e.target.value, stage.id)}
                                                        />
                                                    ) : (
                                                        <div className={styles.clickableTitle} onClick={() => toggleStage(stage.id)}>
                                                            {sidx + 1}. {stage.title} {expandedStages[stage.id] ? '▴' : '▾'}
                                                        </div>
                                                    )}
                                                    {isAdmin && (
                                                        <div className={styles.stageActions}>
                                                            <button onClick={() => toggleStage(stage.id)}>{expandedStages[stage.id] ? '🔼' : '🔽'}</button>
                                                            <button onClick={() => deleteStage(project.id, stage.id)}>🗑️</button>
                                                        </div>
                                                    )}
                                                </div>

                                                {expandedStages[stage.id] && (
                                                    <div className={styles.stageContent}>
                                                        <div className={styles.subSection}>
                                                            <h5>Файлы этапа</h5>
                                                            {isAdmin && (
                                                                <div className={styles.fileUpload}>
                                                                    <button className={styles.tinyBtn}>➕</button>
                                                                    <input type="file" onChange={e => handleFileUpload(e, project.id, stage.id)} />
                                                                </div>
                                                            )}
                                                            <ul className={styles.fileList}>
                                                                {stage.files.map(f => <li key={f.id} onClick={() => downloadFile(f)}>📄 {f.name}</li>)}
                                                            </ul>
                                                        </div>

                                                        <div className={styles.subSection}>
                                                            <div className={styles.flexHeader}>
                                                                <h5>Подэтапы</h5>
                                                                {isAdmin && <button className={styles.tinyBtn} onClick={() => addSubStage(project.id, stage.id)}>➕</button>}
                                                            </div>
                                                            <div className={styles.subStagesList}>
                                                                {stage.subStages.map((ss, ssidx) => (
                                                                    <div key={ss.id} className={styles.subStageItem}>
                                                                        {isAdmin ? (
                                                                            <div className={styles.ssEdit}>
                                                                                <input 
                                                                                    value={ss.title}
                                                                                    onChange={e => updateTitle(project.id, e.target.value, stage.id, ss.id)}
                                                                                />
                                                                                <div className={styles.fileUpload}>
                                                                                    <button className={styles.tinyBtn} title="Добавить файл">📎</button>
                                                                                    <input type="file" onChange={e => handleFileUpload(e, project.id, stage.id, ss.id)} />
                                                                                </div>
                                                                                <button onClick={() => deleteSubStage(project.id, stage.id, ss.id)}>🗑️</button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className={styles.ssView}>
                                                                                <span>{sidx+1}.{ssidx+1} {ss.title}</span>
                                                                                <ul className={styles.ssFiles}>
                                                                                    {ss.files.map(f => <li key={f.id} onClick={() => downloadFile(f)}>📎 {f.name}</li>)}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
