'use client';

import { useState, useEffect } from 'react';
import styles from './OpiManager.module.css';

export interface OpiDocument {
    id: number;
    title: string;
    file: {
        name: string;
        data: string; // Base64
    };
}

export interface OpiEntry {
    id: number;
    productName: string;
    object: string;
    startDate: string;
    endDate: string;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    description?: string;
}

export default function OpiManager() {
    const [docs, setDocs] = useState<OpiDocument[]>([]);
    const [opiEntries, setOpiEntries] = useState<OpiEntry[]>([]);
    const [activeTab, setActiveTab] = useState<'ntd' | 'list'>('ntd');

    // Modals
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<OpiDocument | null>(null);

    const [isOpiModalOpen, setIsOpiModalOpen] = useState(false);
    const [editingOpi, setEditingOpi] = useState<OpiEntry | null>(null);

    useEffect(() => {
        const storedDocs = localStorage.getItem('innovation_opi_ntd');
        if (storedDocs) setDocs(JSON.parse(storedDocs));

        const storedOpi = localStorage.getItem('innovation_opi_list');
        if (storedOpi) setOpiEntries(JSON.parse(storedOpi));
    }, []);

    const saveDocs = (newDocs: OpiDocument[]) => {
        setDocs(newDocs);
        localStorage.setItem('innovation_opi_ntd', JSON.stringify(newDocs));
    };

    const saveOpi = (newOpi: OpiEntry[]) => {
        setOpiEntries(newOpi);
        localStorage.setItem('innovation_opi_list', JSON.stringify(newOpi));
    };

    // NTD Logic
    const openDocModal = (doc?: OpiDocument) => {
        setEditingDoc(doc || { id: Date.now(), title: '', file: { name: '', data: '' } });
        setIsDocModalOpen(true);
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingDoc) return;
        const reader = new FileReader();
        reader.onload = () => {
            setEditingDoc({ ...editingDoc, file: { name: file.name, data: reader.result as string } });
        };
        reader.readAsDataURL(file);
    };

    const saveDoc = () => {
        if (!editingDoc || !editingDoc.title || !editingDoc.file.data) {
            alert('Заполните все поля и выберите файл');
            return;
        }
        const exists = docs.find(d => d.id === editingDoc.id);
        const updated = exists ? docs.map(d => d.id === editingDoc.id ? editingDoc : d) : [...docs, editingDoc];
        saveDocs(updated);
        setIsDocModalOpen(false);
    };

    const deleteDoc = (id: number) => {
        if (confirm('Удалить документ?')) saveDocs(docs.filter(d => d.id !== id));
    };

    // OPI List Logic
    const openOpiModal = (opi?: OpiEntry) => {
        setEditingOpi(opi || {
            id: Date.now(),
            productName: '',
            object: '',
            startDate: '',
            endDate: '',
            status: 'planned',
            description: ''
        });
        setIsOpiModalOpen(true);
    };

    const saveOpiEntry = () => {
        if (!editingOpi || !editingOpi.productName || !editingOpi.object) {
            alert('Заполните основные поля');
            return;
        }
        const exists = opiEntries.find(o => o.id === editingOpi.id);
        const updated = exists ? opiEntries.map(o => o.id === editingOpi.id ? editingOpi : o) : [...opiEntries, editingOpi];
        saveOpi(updated);
        setIsOpiModalOpen(false);
    };

    const deleteOpi = (id: number) => {
        if (confirm('Удалить запись об ОПИ?')) saveOpi(opiEntries.filter(o => o.id !== id));
    };

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button
                    className={activeTab === 'ntd' ? styles.activeTab : ''}
                    onClick={() => setActiveTab('ntd')}
                >Нормативно-техническая документация</button>
                <button
                    className={activeTab === 'list' ? styles.activeTab : ''}
                    onClick={() => setActiveTab('list')}
                >Перечень ОПИ</button>
            </div>

            <div className={styles.content}>
                {activeTab === 'ntd' ? (
                    <div className={styles.section}>
                        <div className={styles.header}>
                            <h2>Документация НТД</h2>
                            <button className={styles.addBtn} onClick={() => openDocModal()}>➕ Добавить документ</button>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Заголовок</th>
                                    <th>Файл</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {docs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>{doc.title}</td>
                                        <td>{doc.file.name}</td>
                                        <td>
                                            <button onClick={() => openDocModal(doc)}>✏️</button>
                                            <button onClick={() => deleteDoc(doc.id)} className={styles.danger}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.section}>
                        <div className={styles.header}>
                            <h2>Перечень ОПИ</h2>
                            <button className={styles.addBtn} onClick={() => openOpiModal()}>➕ Добавить ОПИ</button>
                        </div>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Наименование продукции</th>
                                    <th>Объект</th>
                                    <th>Срок</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {opiEntries.map(opi => (
                                    <tr key={opi.id}>
                                        <td>{opi.productName}</td>
                                        <td>{opi.object}</td>
                                        <td>{opi.startDate} - {opi.endDate}</td>
                                        <td><span className={`${styles.status} ${styles[opi.status]}`}>{opi.status}</span></td>
                                        <td>
                                            <button onClick={() => openOpiModal(opi)}>✏️</button>
                                            <button onClick={() => deleteOpi(opi.id)} className={styles.danger}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Doc Modal */}
            {isDocModalOpen && editingDoc && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingDoc.id ? 'Редактировать документ' : 'Новый документ'}</h3>
                        <div className={styles.field}>
                            <label>Заголовок документа</label>
                            <input
                                type="text"
                                value={editingDoc.title}
                                onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Файл</label>
                            <input type="file" onChange={handleDocUpload} />
                            {editingDoc.file.name && <p>Выбран: {editingDoc.file.name}</p>}
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setIsDocModalOpen(false)}>Отмена</button>
                            <button className={styles.saveBtn} onClick={saveDoc}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}

            {/* OPI Modal */}
            {isOpiModalOpen && editingOpi && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>{editingOpi.id ? 'Редактировать ОПИ' : 'Новое ОПИ'}</h3>
                        <div className={styles.field}>
                            <label>Наименование продукции</label>
                            <input
                                type="text"
                                value={editingOpi.productName}
                                onChange={e => setEditingOpi({ ...editingOpi, productName: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Объект проведения ОПИ</label>
                            <input
                                type="text"
                                value={editingOpi.object}
                                onChange={e => setEditingOpi({ ...editingOpi, object: e.target.value })}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label>Дата начала</label>
                                <input
                                    type="date"
                                    value={editingOpi.startDate}
                                    onChange={e => setEditingOpi({ ...editingOpi, startDate: e.target.value })}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Дата завершения</label>
                                <input
                                    type="date"
                                    value={editingOpi.endDate}
                                    onChange={e => setEditingOpi({ ...editingOpi, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Статус ОПИ</label>
                            <select
                                value={editingOpi.status}
                                onChange={e => setEditingOpi({ ...editingOpi, status: e.target.value as any })}
                            >
                                <option value="planned">Запланировано</option>
                                <option value="in_progress">В процессе</option>
                                <option value="completed">Завершено</option>
                                <option value="cancelled">Отменено</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Подробное описание</label>
                            <textarea
                                value={editingOpi.description}
                                onChange={e => setEditingOpi({ ...editingOpi, description: e.target.value })}
                                rows={4}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setIsOpiModalOpen(false)}>Отмена</button>
                            <button className={styles.saveBtn} onClick={saveOpiEntry}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
