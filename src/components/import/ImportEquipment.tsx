'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Import.module.css';

interface EquipmentItem {
    id: number;
    name: string;
    responsibleSubsidiary: string; // Ответственное структурное подразделение
    hasAnalog: boolean; // Наличие аналога (Да/Нет)
    details: string;
    executionStatus: string;
}

interface ImportEquipmentProps {
    isAdmin?: boolean;
}

const MOCK_EQUIPMENT: EquipmentItem[] = [
    { id: 1, name: 'Насосный агрегат ЦНС', responsibleSubsidiary: 'УТТиСТ', hasAnalog: true, details: 'Российский аналог ГМС', executionStatus: 'Замещено' },
    { id: 2, name: 'Компрессорная установка', responsibleSubsidiary: 'УТТиСТ', hasAnalog: false, details: 'Требуется разработка', executionStatus: 'В работе' },
    { id: 3, name: 'Запорная арматура 300мм', responsibleSubsidiary: 'Служба ИТ', hasAnalog: true, details: 'ПТПА Пенза', executionStatus: 'Замещено' },
    { id: 4, name: 'Система управления Siemens', responsibleSubsidiary: 'Служба ИТ', hasAnalog: false, details: 'Китайский аналог на тестировании', executionStatus: 'Не замещено' },
    { id: 5, name: 'Турбодетандер', responsibleSubsidiary: 'Управление связи', hasAnalog: false, details: 'Импортное оборудование', executionStatus: 'Не замещено' },
];

export default function ImportEquipment({ isAdmin = false }: ImportEquipmentProps) {
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [selectedSP, setSelectedSP] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('import_equipment');
        if (stored) setEquipment(JSON.parse(stored));
        else {
            setEquipment(MOCK_EQUIPMENT);
            localStorage.setItem('import_equipment', JSON.stringify(MOCK_EQUIPMENT));
        }
    }, []);

    const saveEquipment = (data: EquipmentItem[]) => {
        setEquipment(data);
        localStorage.setItem('import_equipment', JSON.stringify(data));
    };

    const subsidiaries = [...new Set(equipment.map(e => e.responsibleSubsidiary))];

    const currentDashboardData = selectedSP 
        ? equipment.filter(e => e.responsibleSubsidiary === selectedSP)
        : equipment;

    const total = currentDashboardData.length;
    const replaced = currentDashboardData.filter(e => e.hasAnalog).length;
    const notReplaced = total - replaced;

    const filteredTable = equipment.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSP = !selectedSP || e.responsibleSubsidiary === selectedSP;
        return matchesSearch && matchesSP;
    });

    // Simple CSS Pie Chart Logic
    const replacedPercent = total > 0 ? (replaced / total) * 100 : 0;
    const notReplacedPercent = 100 - replacedPercent;

    return (
        <div className={styles.moduleContainer}>
            <Link href="/import" className={styles.backLink}>← Вернуться в Импортозамещение</Link>
            
            <header className={styles.hubHeader}>
                <h2>Перечень импортного оборудования Общества</h2>
            </header>

            <div className={styles.equipmentLayout}>
                {/* Left: Chart and Sidebars */}
                <aside>
                    <div className={styles.chartCard}>
                        <h4>Статистика {selectedSP ? `: ${selectedSP}` : '(Всего)'}</h4>
                        <div 
                            className={styles.pieChart} 
                            style={{ 
                                background: `conic-gradient(#10b981 0% ${replacedPercent}%, #ef4444 ${replacedPercent}% 100%)`
                            }}
                        >
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', width: '60%', height: '60%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                {total}
                            </div>
                        </div>
                        <div style={{ textAlign: 'left', fontSize: '0.9rem' }}>
                            <p>🔘 Всего оборудования: <strong>{total}</strong></p>
                            <p>🟢 Замещено: <strong>{replaced}</strong></p>
                            <p>🔴 Не замещено: <strong>{notReplaced}</strong></p>
                        </div>
                    </div>

                    <div className={styles.spList}>
                        <h4>Ответственные подразделения</h4>
                        <div 
                            className={styles.spItem} 
                            data-active={selectedSP === null}
                            onClick={() => setSelectedSP(null)}
                        >
                            Все подразделения
                        </div>
                        {subsidiaries.map(sp => (
                            <div 
                                key={sp} 
                                className={styles.spItem} 
                                data-active={selectedSP === sp}
                                onClick={() => setSelectedSP(sp)}
                            >
                                {sp}
                            </div>
                        ))}
                    </div>

                    {selectedSP && (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff1f2', borderRadius: '8px' }}>
                            <h4 style={{ color: '#991b1b', marginBottom: '0.5rem' }}>Не замещено ({selectedSP})</h4>
                            <ul style={{ fontSize: '0.8rem', paddingLeft: '1.2rem' }}>
                                {currentDashboardData.filter(e => !e.hasAnalog).map(e => <li key={e.id}>{e.name}</li>)}
                                {currentDashboardData.filter(e => !e.hasAnalog).length === 0 && <li>Все оборудование замещено</li>}
                            </ul>
                        </div>
                    )}
                </aside>

                {/* Right: Full Table */}
                <main>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <input 
                            className={styles.inputField} 
                            placeholder="Поиск оборудования по названию..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className={styles.secondaryBtn} onClick={() => setIsFilterOpen(!isFilterOpen)}>🔍 Фильтрация</button>
                    </div>

                    <div className={styles.scrollTableWrapper}>
                        <table className={styles.scrollTable}>
                            <thead>
                                <tr>
                                    <th>Наименование оборудования</th>
                                    <th>Ответственное подразделение</th>
                                    <th>Наличие аналога</th>
                                    <th>Подробности</th>
                                    <th>Статус выполнения</th>
                                    {isAdmin && <th style={{ textAlign: 'center' }}>Действия</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTable.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.name}</td>
                                        <td>{e.responsibleSubsidiary}</td>
                                        <td style={{ color: e.hasAnalog ? 'green' : 'red', fontWeight: 'bold' }}>
                                            {e.hasAnalog ? 'Да' : 'Нет'}
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{e.details}</td>
                                        <td>{e.executionStatus}</td>
                                        {isAdmin && (
                                            <td style={{ textAlign: 'center' }}>
                                                <button onClick={() => saveEquipment(equipment.filter(eq => eq.id !== e.id))} style={{color:'red'}}>🗑️</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>* Используйте ползунок снизу для прокрутки таблицы</p>
                    
                    {isAdmin && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #ccc' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Загрузка данных из Excel</h4>
                            <p style={{ fontSize: '0.85rem' }}>Для автоматической загрузки разместите файл по адресу: <br/> <strong>/home/glotovea@irkutsk-dobycha.gazprom.ru/Рабочий стол/.../Перечень импортного оборудования.xlsx</strong></p>
                            <button className={styles.primaryBtn} onClick={() => alert('Синхронизация с Excel файлом...')}>Синхронизировать сейчас</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
