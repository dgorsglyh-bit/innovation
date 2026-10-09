'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import styles from './EducationManager.module.css';

export interface QuizQuestion {
    id: number;
    question: string;
    answers: string[];
    correctAnswer: number | number[]; // Index or array of indices
    type: 'single' | 'multiple';
}

export interface Quiz {
    id: number;
    title: string;
    questions: QuizQuestion[];
}

export interface Material {
    id: number;
    title: string;
    type: 'presentation' | 'video' | 'document';
    source: string; // URL or base64
    format: string; // .pptx, .pdf, .mp4, etc.
}

interface TestResultDetail {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

interface TestResult {
    id: number;
    quizTitle: string;
    name: string;
    email: string;
    score: number;
    total: number;
    date: string;
    details: TestResultDetail[];
}

export default function EducationManager() {
    // Quizzes State
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [newQuizTitle, setNewQuizTitle] = useState('');

    // Question Form State
    const [qText, setQText] = useState('');
    const [qType, setQType] = useState<'single' | 'multiple'>('single');
    const [answers, setAnswers] = useState<string[]>(['', '']);
    const [correctIndices, setCorrectIndices] = useState<number[]>([0]);

    // Media & Materials State
    const [videoSource, setVideoSource] = useState('');
    const [videoInputType, setVideoInputType] = useState<'url' | 'file'>('url');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [qrCode, setQrCode] = useState('');

    // Material Form State
    const [mTitle, setMTitle] = useState('');
    const [mType, setMType] = useState<'presentation' | 'video' | 'document'>('presentation');
    const [mFormat, setMFormat] = useState('.pdf');
    const [mSource, setMSource] = useState('');
    const [mInputType, setMInputType] = useState<'url' | 'file'>('url');

    // Results State
    const [results, setResults] = useState<TestResult[]>([]);

    useEffect(() => {
        const storedQuizzes = localStorage.getItem('innovation_quizzes');
        if (storedQuizzes) {
            setQuizzes(JSON.parse(storedQuizzes));
        }

        const storedVideo = localStorage.getItem('innovation_video_source');
        if (storedVideo) {
            setVideoSource(storedVideo);
        }

        const storedResults = localStorage.getItem('innovation_test_results');
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }

        const storedMaterials = localStorage.getItem('innovation_materials');
        if (storedMaterials) {
            setMaterials(JSON.parse(storedMaterials));
        } else {
            // Initial defaults if empty
            const initial: Material[] = [
                { id: 1, title: 'Введение в инновационную деятельность', type: 'presentation', source: '', format: '.pptx' },
                { id: 2, title: 'Методика рационализаторства', type: 'video', source: '/videos/instructionnn.mp4', format: '.mp4' },
                { id: 3, title: 'Регламент оформления заявок', type: 'document', source: '', format: '.pdf' },
            ];
            setMaterials(initial);
            localStorage.setItem('innovation_materials', JSON.stringify(initial));
        }

        const storedQr = localStorage.getItem('innovation_qr_code');
        if (storedQr) {
            setQrCode(storedQr);
        }
    }, []);

    const saveQuizzes = (updated: Quiz[]) => {
        setQuizzes(updated);
        localStorage.setItem('innovation_quizzes', JSON.stringify(updated));
    };

    const addQuiz = () => {
        if (!newQuizTitle.trim()) return;
        const newQ: Quiz = { id: Date.now(), title: newQuizTitle, questions: [] };
        const updated = [...quizzes, newQ];
        saveQuizzes(updated);
        setNewQuizTitle('');
        setCurrentQuizIndex(updated.length - 1);
    };

    const deleteQuiz = () => {
        if (quizzes.length <= 1) {
            alert('Нельзя удалить последний тест');
            return;
        }
        if (confirm(`Удалить тест "${quizzes[currentQuizIndex].title}" со всеми вопросами?`)) {
            const updated = quizzes.filter((_, i) => i !== currentQuizIndex);
            saveQuizzes(updated);
            setCurrentQuizIndex(0);
        }
    };

    const addQuestion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!qText || answers.some(a => !a.trim())) {
            alert('Заполните вопрос и все варианты ответов');
            return;
        }
        if (correctIndices.length === 0) {
            alert('Выберите хотя бы один правильный ответ');
            return;
        }
        const newQ: QuizQuestion = {
            id: Date.now(),
            question: qText,
            answers,
            correctAnswer: qType === 'single' ? correctIndices[0] : correctIndices,
            type: qType
        };
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[currentQuizIndex].questions.push(newQ);
        saveQuizzes(updatedQuizzes);
        setQText('');
        setAnswers(['', '']);
        setCorrectIndices([0]);
        setQType('single');
    };

    const deleteQuestion = (id: number) => {
        if (confirm('Удалить вопрос?')) {
            const updatedQuizzes = [...quizzes];
            updatedQuizzes[currentQuizIndex].questions = updatedQuizzes[currentQuizIndex].questions.filter(q => q.id !== id);
            saveQuizzes(updatedQuizzes);
        }
    };

    const handleAnswerChange = (idx: number, val: string) => {
        const newAns = [...answers];
        newAns[idx] = val;
        setAnswers(newAns);
    };

    const toggleCorrectIndex = (idx: number) => {
        if (qType === 'single') {
            setCorrectIndices([idx]);
        } else {
            if (correctIndices.includes(idx)) {
                setCorrectIndices(correctIndices.filter(i => i !== idx));
            } else {
                setCorrectIndices([...correctIndices, idx].sort());
            }
        }
    };

    const addAnswerOption = () => setAnswers([...answers, '']);
    const removeAnswerOption = (idx: number) => {
        if (answers.length <= 2) return;
        const newAns = answers.filter((_, i) => i !== idx);
        setAnswers(newAns);
        setCorrectIndices(correctIndices.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
    };

    // Media Handlers
    const getEmbedUrl = (url: string) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        if (url.includes('rutube.ru/video/')) {
            return url.replace('rutube.ru/video/', 'rutube.ru/play/embed/');
        }
        return url;
    };

    const isEmbed = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('rutube.ru');
    };

    const saveVideoSource = () => {
        try {
            localStorage.setItem('innovation_video_source', videoSource);
            alert('Видеоинструктаж сохранен');
        } catch (e) {
            if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                alert('Ошибка: Файл слишком велик для памяти браузера. Пожалуйста, используйте вариант "URL ссылка" для видео больших размеров.');
            } else {
                alert('Произошла ошибка при сохранении видео.');
            }
        }
    };

    const handleVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4.5 * 1024 * 1024) { // ~4.5MB limit
                alert('Внимание: Вы пытаетесь загрузить файл объемом ' + (file.size / (1024 * 1024)).toFixed(2) + ' МБ. Лимит браузера — около 5 МБ. Рекомендуется использовать "URL ссылку".');
            }
            const reader = new FileReader();
            reader.onloadend = () => setVideoSource(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const saveQrCode = () => {
        try {
            localStorage.setItem('innovation_qr_code', qrCode);
            alert('QR-код сохранен');
        } catch (e) {
            alert('Ошибка: Не удалось сохранить изображение. Возможно, оно слишком большое. Попробуйте сжать его или использовать другой файл.');
        }
    };

    const handleQrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setQrCode(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const addMaterial = () => {
        if (!mTitle.trim()) return;
        const newM: Material = {
            id: Date.now(),
            title: mTitle,
            type: mType,
            format: mFormat,
            source: mSource
        };
        const updated = [...materials, newM];

        try {
            localStorage.setItem('innovation_materials', JSON.stringify(updated));
            setMaterials(updated);
            setMTitle('');
            setMSource('');
            alert('Материал добавлен');
        } catch (e) {
            alert('Ошибка: Не удалось сохранить материал. Память браузера переполнена. Пожалуйста, удалите старые материалы или используйте "URL ссылку" вместо загрузки файла.');
        }
    };

    const deleteMaterial = (id: number) => {
        if (confirm('Удалить материал?')) {
            const updated = materials.filter(m => m.id !== id);
            setMaterials(updated);
            localStorage.setItem('innovation_materials', JSON.stringify(updated));
        }
    };

    const handleMaterialFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setMSource(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const deleteResult = (id: number) => {
        if (confirm('Удалить результат?')) {
            const updated = results.filter(r => r.id !== id);
            setResults(updated);
            localStorage.setItem('innovation_test_results', JSON.stringify(updated));
        }
    };

    const downloadExcel = (filterQuizTitle?: string) => {
        let dataToExport = results;
        if (filterQuizTitle) dataToExport = results.filter(r => r.quizTitle === filterQuizTitle);
        if (dataToExport.length === 0) {
            alert('Нет результатов для выгрузки');
            return;
        }
        const summaryData = dataToExport.map(r => ({
            'ID': r.id, 'Тест': r.quizTitle, 'ФИО': r.name, 'Email': r.email,
            'Балл': r.score, 'Всего': r.total, 'Процент': `${Math.round((r.score / r.total) * 100)}%`, 'Дата': r.date
        }));
        const detailedData: any[] = [];
        dataToExport.forEach(r => {
            r.details?.forEach((d, idx) => {
                detailedData.push({
                    'ФИО': r.name, 'Email': r.email, 'Тест': r.quizTitle,
                    'Вопрос №': idx + 1, 'Вопрос': d.question, 'Ответ пользователя': d.userAnswer,
                    'Правильный ответ': d.correctAnswer, 'Верно': d.isCorrect ? 'Да' : 'Нет'
                });
            });
        });
        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Сводка");
        if (detailedData.length > 0) {
            const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
            XLSX.utils.book_append_sheet(wb, wsDetailed, "Детали ответов");
        }
        const filename = filterQuizTitle ? `Результаты_${filterQuizTitle}_${new Date().toLocaleDateString()}.xlsx` : `Все_результаты_тестирования_${new Date().toLocaleDateString()}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    return (
        <div className={styles.container}>
            {/* 1. Results Section */}
            <section className={styles.form}>
                <h2>Результаты тестирования</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => downloadExcel()} className={styles.exportBtn}>📥 Выгрузить ВСЕ в Excel</button>
                    {quizzes.map(q => (
                        <button key={q.id} onClick={() => downloadExcel(q.title)} className={styles.exportBtn} style={{ background: '#6c757d' }}>📥 Экспорт: {q.title}</button>
                    ))}
                </div>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                    <table className={styles.resultsTable}>
                        <thead>
                            <tr><th>Тест</th><th>ФИО</th><th>Email</th><th>Балл</th><th>Дата</th><th>Действие</th></tr>
                        </thead>
                        <tbody>
                            {results.map(res => (
                                <tr key={res.id}>
                                    <td>{res.quizTitle}</td><td>{res.name}</td><td>{res.email}</td><td>{res.score} / {res.total}</td><td>{res.date}</td>
                                    <td><button onClick={() => deleteResult(res.id)} className={styles.deleteBtn}>Удалить</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2. Materials Management */}
            <section className={styles.form}>
                <h2>Управление материалами (презентации, видео, документы)</h2>
                <div className={styles.field}>
                    <label>Название материала:</label>
                    <input type="text" value={mTitle} onChange={e => setMTitle(e.target.value)} placeholder="Название..." />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className={styles.field} style={{ flex: 1 }}>
                        <label>Тип:</label>
                        <select value={mType} onChange={e => setMType(e.target.value as any)}>
                            <option value="presentation">Презентация</option>
                            <option value="video">Видео</option>
                            <option value="document">Документ</option>
                        </select>
                    </div>
                    <div className={styles.field} style={{ flex: 1 }}>
                        <label>Формат (текст):</label>
                        <input type="text" value={mFormat} onChange={e => setMFormat(e.target.value)} placeholder=".pdf, .pptx, .mp4..." />
                    </div>
                </div>
                <div className={styles.field}>
                    <label>Источник:</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <label style={{ fontWeight: 'normal' }}><input type="radio" checked={mInputType === 'url'} onChange={() => setMInputType('url')} /> URL ссылка</label>
                        <label style={{ fontWeight: 'normal' }}><input type="radio" checked={mInputType === 'file'} onChange={() => setMInputType('file')} /> Файл</label>
                    </div>
                    {mInputType === 'url' ? (
                        <input type="text" value={mSource} onChange={e => setMSource(e.target.value)} placeholder="https://..." />
                    ) : (
                        <input type="file" onChange={handleMaterialFile} />
                    )}
                </div>
                <button onClick={addMaterial} className={styles.btnSecondary}>Добавить материал</button>

                <div className={styles.list} style={{ marginTop: '1rem' }}>
                    {materials.map(m => (
                        <div key={m.id} className={styles.item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong>{m.title}</strong> ({m.type} - {m.format})
                            </div>
                            <button onClick={() => deleteMaterial(m.id)} className={styles.deleteBtn}>Удалить</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Multimedia Section (Video instruction & QR Code) */}
            <section className={styles.form} style={{ background: '#f8f9fc', border: '1px solid #d1d9e6' }}>
                <h2>Визуальные ассеты инструкции</h2>
                <div className={styles.field}>
                    <label>Видеоинструктаж:</label>
                    <div style={{ background: '#eef2f7', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', borderLeft: '4px solid #007bff' }}>
                        <strong>💡 Для больших видео (&gt;5 МБ):</strong><br />
                        1. Поместите файл в папку: <code style={{ background: '#eee', padding: '2px 4px' }}>C:\Projects\innovation\public\videos\</code><br />
                        2. Выберите <strong>"URL ссылка"</strong> и введите путь: <code style={{ background: '#eee', padding: '2px 4px' }}>/videos/название_файла.mp4</code>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                        <label style={{ fontWeight: 'normal' }}><input type="radio" checked={videoInputType === 'url'} onChange={() => setVideoInputType('url')} /> URL / Путь на сервере</label>
                        <label style={{ fontWeight: 'normal' }}><input type="radio" checked={videoInputType === 'file'} onChange={() => setVideoInputType('file')} /> Файл (до 5 МБ)</label>
                    </div>
                    {videoInputType === 'url' ? (
                        <input type="text" value={videoSource} onChange={e => setVideoSource(e.target.value)} placeholder="Пример: /videos/instruction.mp4 или ссылка YouTube/Rutube" />
                    ) : (
                        <input type="file" onChange={handleVideoFile} />
                    )}
                    <button onClick={saveVideoSource} className={styles.submitButton} style={{ marginTop: '0.5rem' }}>Сохранить видео</button>

                    {videoSource && (
                        <div style={{ marginTop: '1rem' }}>
                            <label>Предпросмотр:</label>
                            <div style={{ width: '100%', height: '200px', background: '#000', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
                                {isEmbed(videoSource) ? (
                                    <iframe
                                        src={getEmbedUrl(videoSource)}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video src={videoSource} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <hr style={{ margin: '1rem 0' }} />

                <div className={styles.field}>
                    <label>Картинка QR-кода:</label>
                    <input type="file" accept="image/*" onChange={handleQrFile} />
                    {qrCode && <img src={qrCode} alt="QR Preview" style={{ width: 100, height: 100, marginTop: '0.5rem', border: '1px solid #ccc' }} />}
                    <button onClick={saveQrCode} className={styles.submitButton} style={{ marginTop: '0.5rem' }}>Сохранить QR-код</button>
                </div>
            </section>

            {/* 4. Quiz Management */}
            <section className={styles.form}>
                <h2>Управление тестами</h2>
                <div className={styles.quizSelector}>
                    <select value={currentQuizIndex} onChange={(e) => setCurrentQuizIndex(+e.target.value)}>
                        {quizzes.map((q, i) => <option key={q.id} value={i}>{q.title}</option>)}
                    </select>
                    <button onClick={deleteQuiz} className={styles.btnDanger}>Удалить текущий тест</button>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" value={newQuizTitle} onChange={e => setNewQuizTitle(e.target.value)} placeholder="Название нового теста" style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    <button onClick={addQuiz} className={styles.btnSecondary}>Создать новый тест</button>
                </div>
            </section>

            {quizzes[currentQuizIndex] && (
                <>
                    <form onSubmit={addQuestion} className={styles.form}>
                        <h3>Добавить вопрос в "{quizzes[currentQuizIndex].title}"</h3>
                        <div className={styles.field}>
                            <label>Тип вопроса:</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ fontWeight: 'normal' }}><input type="radio" checked={qType === 'single'} onChange={() => { setQType('single'); setCorrectIndices([0]); }} /> Один ответ</label>
                                <label style={{ fontWeight: 'normal' }}><input type="radio" checked={qType === 'multiple'} onChange={() => setQType('multiple')} /> Несколько ответов</label>
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Текст вопроса:</label>
                            <textarea value={qText} onChange={e => setQText(e.target.value)} required rows={3} />
                        </div>
                        <div className={styles.field}>
                            <label>Варианты ответов:</label>
                            {answers.map((ans, idx) => (
                                <div key={idx} className={styles.answerRow}>
                                    <input type={qType === 'single' ? "radio" : "checkbox"} checked={correctIndices.includes(idx)} onChange={() => toggleCorrectIndex(idx)} />
                                    <input type="text" value={ans} onChange={e => handleAnswerChange(idx, e.target.value)} placeholder={`Вариант ${idx + 1}`} required />
                                    <button type="button" onClick={() => removeAnswerOption(idx)} className={styles.removeAnswerBtn}>×</button>
                                </div>
                            ))}
                            <button type="button" onClick={addAnswerOption} className={styles.addAnswerBtn}>+ Добавить вариант</button>
                        </div>
                        <button type="submit" className={styles.submitButton}>Сохранить вопрос</button>
                    </form>

                    <div className={styles.list}>
                        <h3>Вопросы теста ({quizzes[currentQuizIndex].questions.length})</h3>
                        {quizzes[currentQuizIndex].questions.map((q, i) => (
                            <div key={q.id} className={styles.item}>
                                <div className={styles.itemHeader}>
                                    <strong>{i + 1}. {q.question}</strong>
                                    <button onClick={() => deleteQuestion(q.id)} className={styles.deleteBtn}>Удалить</button>
                                </div>
                                <ul className={styles.answersList}>
                                    {q.answers.map((ans, idx) => {
                                        const isCorrect = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(idx) : q.correctAnswer === idx;
                                        return <li key={idx} style={{ color: isCorrect ? '#28a745' : 'inherit', fontWeight: isCorrect ? 'bold' : 'normal' }}>{isCorrect ? '●' : '○'} {ans}</li>;
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
