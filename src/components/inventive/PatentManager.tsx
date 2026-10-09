'use client';

import { useState, useEffect } from 'react';
import styles from './PatentManager.module.css';

export type PatentType = 'invention' | 'utility_model' | 'software';

export interface PatentFile {
    name: string;
    data: string; // Base64
    type: string;
}

export interface Patent {
    id: number;
    title: string;
    type: PatentType;
    number: string;
    issueDate: string;
    expiryDate: string;
    authors: string[];
    description: string;
    results: string;
    implementationObject: string;
    files: PatentFile[];
    images: string[]; // Base64 strings
}

const TYPE_LABELS: Record<PatentType, string> = {
    invention: 'Изобретение',
    utility_model: 'Полезная модель',
    software: 'Программа для ЭВМ'
};

export default function PatentManager() {
    const [patents, setPatents] = useState<Patent[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [type, setType] = useState<PatentType>('invention');
    const [number, setNumber] = useState('');
    const [issueDate, setIssueDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [authorInput, setAuthorInput] = useState('');
    const [description, setDescription] = useState('');
    const [results, setResults] = useState('');
    const [implementationObject, setImplementationObject] = useState('');
    const [files, setFiles] = useState<PatentFile[]>([]);
    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_patents');
        if (stored) {
            setPatents(JSON.parse(stored));
        }
    }, []);

    const saveToStorage = (data: Patent[]) => {
        try {
            setPatents(data);
            localStorage.setItem('innovation_patents', JSON.stringify(data));
        } catch (e) {
            alert('Ошибка: Память браузера переполнена. Попробуйте загрузить файлы/изображения меньшего размера.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setType('invention');
        setNumber('');
        setIssueDate('');
        setExpiryDate('');
        setAuthorInput('');
        setDescription('');
        setResults('');
        setImplementationObject('');
        setFiles([]);
        setImages([]);
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !number || !issueDate || !authorInput) {
            alert('Пожалуйста, заполните обязательные поля');
            return;
        }

        const authors = authorInput.split(',').map(a => a.trim()).filter(a => a.length > 0);

        if (editingId) {
            const updated = patents.map(p =>
                p.id === editingId
                    ? {
                        ...p, title, type, number, issueDate, expiryDate, authors,
                        description, results, implementationObject, files, images
                    }
                    : p
            );
            saveToStorage(updated);
            alert('Патент успешно обновлен');
        } else {
            const newPatent: Patent = {
                id: Date.now(),
                title,
                type,
                number,
                issueDate,
                expiryDate,
                authors,
                description,
                results,
                implementationObject,
                files,
                images
            };
            saveToStorage([...patents, newPatent]);
            alert('Патент успешно добавлен');
        }
        resetForm();
    };

    const handleEdit = (patent: Patent) => {
        setEditingId(patent.id);
        setTitle(patent.title);
        setType(patent.type);
        setNumber(patent.number);
        setIssueDate(patent.issueDate);
        setExpiryDate(patent.expiryDate);
        setAuthorInput(patent.authors.join(', '));
        setDescription(patent.description || '');
        setResults(patent.results || '');
        setImplementationObject(patent.implementationObject || '');
        setFiles(patent.files || []);
        setImages(patent.images || []);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newFile: PatentFile = {
                    name: file.name,
                    data: reader.result as string,
                    type: file.type
                };
                setFiles([...files, newFile]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages([...images, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleDelete = (id: number) => {
        if (confirm('Вы уверены, что хотите удалить этот патент?')) {
            const filtered = patents.filter(p => p.id !== id);
            saveToStorage(filtered);
        }
    };

    return (
        <div className={styles.manager}>
            <section className={styles.form}>
                <h2>{editingId ? 'Редактировать патент' : 'Добавить новый патент'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className={styles.grid}>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label>Название объекта *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Вид ООП *</label>
                            <select value={type} onChange={(e) => setType(e.target.value as PatentType)}>
                                <option value="invention">Изобретение</option>
                                <option value="utility_model">Полезная модель</option>
                                <option value="software">Программа для ЭВМ</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Номер *</label>
                            <input
                                type="text"
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Дата выдачи *</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Срок действия (необяз.)</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                            />
                        </div>
                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label>Авторы (через запятую) *</label>
                            <input
                                type="text"
                                value={authorInput}
                                onChange={(e) => setAuthorInput(e.target.value)}
                                placeholder="Иванов И.И., Петров П.П."
                                required
                            />
                        </div>

                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <label>Краткое описание</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className={styles.textArea}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Достигаемые результаты</label>
                            <textarea
                                value={results}
                                onChange={(e) => setResults(e.target.value)}
                                rows={3}
                                className={styles.textArea}
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Потенциальный объект внедрения</label>
                            <textarea
                                value={implementationObject}
                                onChange={(e) => setImplementationObject(e.target.value)}
                                rows={3}
                                className={styles.textArea}
                            />
                        </div>

                        <div className={`${styles.field} ${styles.fullWidth}`}>
                            <div className={styles.fileSection}>
                                <div className={styles.infoBox}>
                                    💡 Лимит localStorage — 5МБ. Старайтесь не загружать много тяжелых файлов и фото.
                                </div>

                                <label>Прилагаемые файлы</label>
                                <input type="file" onChange={handleFileUpload} style={{ marginBottom: '0.5rem' }} />
                                <div className={styles.fileList}>
                                    {files.map((file, i) => (
                                        <div key={i} className={styles.fileItem}>
                                            <span>📄 {file.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className={styles.deleteBtn}>Удалить</button>
                                        </div>
                                    ))}
                                </div>

                                <label style={{ marginTop: '1.5rem', display: 'block' }}>Рисунки / Галерея</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '0.5rem' }} />
                                <div className={styles.imageGrid}>
                                    {images.map((img, i) => (
                                        <div key={i} className={styles.imageWrapper}>
                                            <img src={img} alt={`Preview ${i}`} />
                                            <button type="button" onClick={() => removeImage(i)} className={styles.removeImg}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button type="submit" className={styles.submitBtn}>
                            {editingId ? 'Сохранить изменения' : 'Добавить патент'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                                Отмена
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className={styles.listSection}>
                <h2>Список патентов</h2>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Тип</th>
                                <th>Название</th>
                                <th>Номер</th>
                                <th>Дата выдачи</th>
                                <th>Авторы</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center' }}>Патентов пока нет</td>
                                </tr>
                            ) : (
                                patents.map(patent => (
                                    <tr key={patent.id}>
                                        <td>
                                            <span className={`${styles.badge} ${styles[`badge_${patent.type.split('_')[0]}`]}`}>
                                                {TYPE_LABELS[patent.type]}
                                            </span>
                                        </td>
                                        <td>{patent.title}</td>
                                        <td>{patent.number}</td>
                                        <td>{patent.issueDate}</td>
                                        <td>{patent.authors.join(', ')}</td>
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleEdit(patent)}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(patent.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
