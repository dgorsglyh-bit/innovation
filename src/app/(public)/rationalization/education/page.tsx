'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface QuizQuestion {
    id: number;
    question: string;
    answers: string[];
    correctAnswer: number | number[];
    type: 'single' | 'multiple';
}

interface Quiz {
    id: number;
    title: string;
    questions: QuizQuestion[];
}

interface Material {
    id: number;
    title: string;
    type: 'presentation' | 'video' | 'document';
    source: string;
    format: string;
}

export default function EducationPage() {
    const [activeTab, setActiveTab] = useState<'materials' | 'instruction'>('materials');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: number | number[] }>({});
    const [showResultModal, setShowResultModal] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [score, setScore] = useState<number | null>(null);

    // Media & Materials
    const [videoSource, setVideoSource] = useState('');
    const [materials, setMaterials] = useState<Material[]>([]);
    const [qrCode, setQrCode] = useState('');

    useEffect(() => {
        // Load Quizzes
        const storedQuizzes = localStorage.getItem('innovation_quizzes');
        if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));

        // Load Materials
        const storedMaterials = localStorage.getItem('innovation_materials');
        if (storedMaterials) {
            setMaterials(JSON.parse(storedMaterials));
        } else {
            // Default mock data if empty
            setMaterials([
                { id: 1, title: 'Введение в инновационную деятельность', type: 'presentation', source: '', format: '.pptx' },
                { id: 2, title: 'Методика рационализаторства', type: 'video', source: '', format: '.mp4' },
                { id: 3, title: 'Регламент оформления заявок', type: 'document', source: '', format: '.pdf' },
            ]);
        }

        // Load QR Code
        const storedQr = localStorage.getItem('innovation_qr_code');
        if (storedQr) setQrCode(storedQr);

        // Load Video
        const storedVideo = localStorage.getItem('innovation_video_source');
        if (storedVideo) {
            setVideoSource(storedVideo);
        } else {
            // Default video if none set
            setVideoSource('/videos/instructionnn.mp4');
        }
    }, []);

    const handleAnswerSelect = (qId: number, aIdx: number, type: 'single' | 'multiple') => {
        if (type === 'single') {
            setUserAnswers(prev => ({ ...prev, [qId]: aIdx }));
        } else {
            const current = (userAnswers[qId] as number[]) || [];
            if (current.includes(aIdx)) {
                setUserAnswers(prev => ({ ...prev, [qId]: current.filter(i => i !== aIdx) }));
            } else {
                setUserAnswers(prev => ({ ...prev, [qId]: [...current, aIdx].sort() }));
            }
        }
    };

    const isQuestionCorrect = (q: QuizQuestion, uAns: number | number[]) => {
        if (q.type === 'single') return uAns === q.correctAnswer;
        const correct = (q.correctAnswer as number[]).sort();
        const selected = ((uAns as number[]) || []).sort();
        return correct.length === selected.length && correct.every((val, index) => val === selected[index]);
    };

    const calculateScore = () => {
        if (!selectedQuiz) return 0;
        let s = 0;
        selectedQuiz.questions.forEach(q => {
            if (isQuestionCorrect(q, userAnswers[q.id])) s++;
        });
        return s;
    };

    const handleShowResult = () => {
        if (!selectedQuiz) return;
        if (Object.keys(userAnswers).length < selectedQuiz.questions.length) {
            alert('Пожалуйста, ответьте на все вопросы.');
            return;
        }
        setShowResultModal(true);
    };

    const handleConfirmResult = () => {
        if (!userName.trim() || !userEmail.trim() || !userEmail.includes('@')) {
            alert('Пожалуйста, введите корректные данные (ФИО и Email)');
            return;
        }
        const calculatedScore = calculateScore();
        setScore(calculatedScore);
        const details = selectedQuiz!.questions.map(q => {
            const uAns = userAnswers[q.id];
            let userAnsText = q.type === 'single' ? (q.answers[uAns as number] || 'Нет ответа') : (((uAns as number[]) || []).map(i => q.answers[i]).join(', ') || 'Нет ответа');
            let correctAnsText = q.type === 'single' ? q.answers[q.correctAnswer as number] : (q.correctAnswer as number[]).map(i => q.answers[i]).join(', ');
            return { question: q.question, userAnswer: userAnsText, correctAnswer: correctAnsText, isCorrect: isQuestionCorrect(q, uAns) };
        });
        const newResult = { id: Date.now(), quizTitle: selectedQuiz!.title, name: userName, email: userEmail, score: calculatedScore, total: selectedQuiz!.questions.length, date: new Date().toLocaleString(), details };
        const existingResults = JSON.parse(localStorage.getItem('innovation_test_results') || '[]');
        localStorage.setItem('innovation_test_results', JSON.stringify([...existingResults, newResult]));
        alert(`Результат отправлен! Ваша оценка: ${calculatedScore} из ${selectedQuiz!.questions.length}`);
        setShowResultModal(false);
        setSelectedQuiz(null);
        setUserAnswers({});
    };

    const handleMaterialAction = (m: Material) => {
        if (!m.source && m.type !== 'video') {
            alert('Файл или ссылка для этого материала еще не загружена администратором.');
            return;
        }

        if (m.type === 'video') {
            // If it's a video, play it in our player
            const finalSource = m.source || '/videos/instructionnn.mp4';
            setVideoSource(finalSource);
            setActiveTab('instruction');
            // Scroll to top to see the player if it's far down
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (m.source.startsWith('http')) {
            window.open(m.source, '_blank');
        } else {
            // Base64 download
            const link = document.createElement('a');
            link.href = m.source;
            link.download = `${m.title}${m.format || ''}`;
            link.click();
        }
    };

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

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Раздел "Обучение"</h1>
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${activeTab === 'materials' ? styles.activeTab : ''}`} onClick={() => setActiveTab('materials')}>Материалы</button>
                <button className={`${styles.tab} ${activeTab === 'instruction' ? styles.activeTab : ''}`} onClick={() => setActiveTab('instruction')}>Видеоинструктаж и Тест</button>
            </div>

            {activeTab === 'materials' && (
                <div className={styles.content}>
                    <h2>Презентации и Видео</h2>
                    <div className={styles.materialList}>
                        {materials.map(m => (
                            <div key={m.id} className={styles.materialCard}>
                                <h3>{m.title}</h3>
                                <p>{m.type === 'presentation' ? 'Презентация' : m.type === 'video' ? 'Видеоурок' : 'Документ'}</p>
                                <button className={styles.downloadBtn} onClick={() => handleMaterialAction(m)}>
                                    {m.type === 'video' ? 'Смотреть' : 'Скачать'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'instruction' && (
                <div className={styles.content}>
                    <div className={styles.videoSection}>
                        <div className={styles.videoPlayer}>
                            {videoSource ? (
                                isEmbed(videoSource) ? (
                                    <iframe
                                        key={getEmbedUrl(videoSource)}
                                        src={getEmbedUrl(videoSource)}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video
                                        key={videoSource}
                                        src={videoSource}
                                        controls
                                        preload="metadata"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        onError={() => alert('Ошибка загрузки видео. Проверьте путь или формат файла. Возможно, файл /videos/instructionnn.mp4 отсутствует.')}
                                    >
                                        Ваш браузер не поддерживает видео.
                                    </video>
                                )
                            ) : (
                                <div style={{ padding: '20px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Видеоинструктаж не загружен</div>
                            )}
                        </div>
                        <div className={styles.qrSection}>
                            {qrCode ? (
                                <img src={qrCode} alt="QR Code" style={{ maxWidth: '100%' }} />
                            ) : (
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/video" alt="Default QR Code" />
                            )}
                            <p>Сканируйте для просмотра на телефоне</p>
                        </div>
                    </div>

                    <div className={styles.testSection}>
                        <h2>Тестирование</h2>
                        {quizzes.length === 0 ? (
                            <p>Тесты пока не доступны</p>
                        ) : !selectedQuiz ? (
                            <div className={styles.quizList}>
                                <h3>Выберите тест для прохождения:</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                    {quizzes.map(q => (
                                        <div key={q.id} className={styles.materialCard} style={{ cursor: 'pointer' }} onClick={() => setSelectedQuiz(q)}>
                                            <h3>{q.title}</h3>
                                            <p>Вопросов: {q.questions.length}</p>
                                            <button className={styles.downloadBtn}>Начать тест</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.quiz}>
                                <button onClick={() => setSelectedQuiz(null)} style={{ marginBottom: '1rem', background: 'none', border: 'none', color: 'var(--primary-blue)', cursor: 'pointer', textDecoration: 'underline' }}>← Назад к списку тестов</button>
                                <h3>{selectedQuiz.title}</h3>
                                {selectedQuiz.questions.map((q, i) => (
                                    <div key={q.id} className={styles.questionBlock}>
                                        <p className={styles.qText}>{i + 1}. {q.question} <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '0.5rem' }}>({q.type === 'single' ? 'один правильный ответ' : 'несколько правильных ответов'})</span></p>
                                        <div className={styles.options}>
                                            {q.answers.map((ans, idx) => (
                                                <label key={idx} className={styles.option}>
                                                    <input type={q.type === 'single' ? "radio" : "checkbox"} name={`q-${q.id}`} checked={q.type === 'single' ? userAnswers[q.id] === idx : ((userAnswers[q.id] as number[]) || []).includes(idx)} onChange={() => handleAnswerSelect(q.id, idx, q.type)} />
                                                    {ans}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleShowResult} className={styles.resultBtn}>Завершить и посмотреть результат</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showResultModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>Подтверждение результата</h2>
                        <input type="text" placeholder="ФИО" value={userName} onChange={e => setUserName(e.target.value)} className={styles.nameInput} style={{ marginBottom: '1rem' }} />
                        <input type="email" placeholder="Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className={styles.nameInput} />
                        <div className={styles.modalButtons}>
                            <button onClick={() => setShowResultModal(false)} className={styles.cancelBtn}>Отмена</button>
                            <button onClick={handleConfirmResult} className={styles.confirmBtn}>Подтвердить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
