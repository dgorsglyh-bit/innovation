'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Regions.module.css';

interface EnterpriseDK {
    id: number;
    name: string;
    reviewYear: string;
    units: Record<string, number>; // key is year
}

interface EnterpriseSupply {
    id: number;
    name: string;
    productType: string;
    values: Record<string, number>; // key is year, value is mln rub
}

interface RegionsDashboardProps {
    isAdmin?: boolean;
}

export default function RegionsDashboard({ isAdmin = false }: RegionsDashboardProps) {
    const [yearsDK, setYearsDK] = useState<string[]>(['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']);
    const [yearsSupply, setYearsSupply] = useState<string[]>(['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']);
    
    const [dataDK, setDataDK] = useState<EnterpriseDK[]>([]);
    const [dataSupply, setDataSupply] = useState<EnterpriseSupply[]>([]);
    
    // Additional state for third table if needed
    const [dataGeneral, setDataGeneral] = useState<{id: number, name: string, info: string}[]>([]);

    useEffect(() => {
        const dkStored = localStorage.getItem('regions_data_dk');
        if (dkStored) setDataDK(JSON.parse(dkStored));
        else {
            const initial = [{ id: 1, name: 'АО "Завод А"', reviewYear: '2022', units: { '2022': 50, '2023': 60 } }];
            setDataDK(initial);
            localStorage.setItem('regions_data_dk', JSON.stringify(initial));
        }

        const supplyStored = localStorage.getItem('regions_data_supply');
        if (supplyStored) setDataSupply(JSON.parse(supplyStored));
        else {
            const initial = [{ id: 1, name: 'ООО "Поставщик Б"', productType: 'Трубы', values: { '2023': 120, '2024': 150 } }];
            setDataSupply(initial);
            localStorage.setItem('regions_data_supply', JSON.stringify(initial));
        }

        const ydkStored = localStorage.getItem('regions_years_dk');
        if (ydkStored) setYearsDK(JSON.parse(ydkStored));

        const ysupStored = localStorage.getItem('regions_years_supply');
        if (ysupStored) setYearsSupply(JSON.parse(ysupStored));
        
        const genStored = localStorage.getItem('regions_data_gen');
        if (genStored) setDataGeneral(JSON.parse(genStored));
    }, []);

    const saveDK = (d: EnterpriseDK[]) => { setDataDK(d); localStorage.setItem('regions_data_dk', JSON.stringify(d)); };
    const saveSupply = (d: EnterpriseSupply[]) => { setDataSupply(d); localStorage.setItem('regions_data_supply', JSON.stringify(d)); };
    const saveYearsDK = (y: string[]) => { setYearsDK(y); localStorage.setItem('regions_years_dk', JSON.stringify(y)); };
    const saveYearsSupply = (y: string[]) => { setYearsSupply(y); localStorage.setItem('regions_years_supply', JSON.stringify(y)); };

    // Chart Calculation: Supply by Year
    const supplyStats = yearsSupply.map(y => {
        const sum = dataSupply.reduce((acc, row) => acc + (row.values[y] || 0), 0);
        return { year: y, sum };
    });

    const maxSupply = Math.max(...supplyStats.map(s => s.sum), 1);

    // Chart Calculation: Product Types
    const productTypes = [...new Set(dataSupply.map(d => d.productType))];
    const totalByTypes = dataSupply.length;
    const typeStats = productTypes.map(type => {
        const count = dataSupply.filter(d => d.productType === type).length;
        const percent = Math.round((count / totalByTypes) * 100);
        return { type, count, percent };
    });

    // Chart Calculation: Roadmap (Dual Axis)
    const dkStats = yearsDK.map(y => {
        const count = dataDK.filter(d => d.reviewYear === y).length;
        const units = dataDK.reduce((acc, row) => acc + (row.units[y] || 0), 0);
        return { year: y, count, units };
    });

    const maxDKCount = Math.max(...dkStats.map(s => s.count), 1);
    const maxDKUnits = Math.max(...dkStats.map(s => s.units), 1);

    return (
        <div className={styles.moduleContainer}>
            <Link href="/regions" className={styles.backLink}>← Вернуться к регионам</Link>
            <header className={styles.hubHeader}>
                <h2>Дашборд взаимодействия с регионами</h2>
            </header>

            {/* Table 1: DK */}
            <section style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Предприятия, рассмотренные по ДК</h3>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className={styles.secondaryBtn} onClick={() => saveYearsDK([...yearsDK, `${parseInt(yearsDK[yearsDK.length-1])+1}`])}>+ Год</button>
                            <button className={styles.primaryBtn} onClick={() => saveDK([...dataDK, { id: Date.now(), name: 'Новое предприятие', reviewYear: '', units: {} }])}>Добавить предприятие</button>
                        </div>
                    )}
                </div>
                <div className={styles.scrollContainer}>
                    <table className={styles.dashboardTable}>
                        <thead>
                            <tr>
                                <th>Название предприятия</th>
                                <th>Год рассмотрения</th>
                                {yearsDK.map((year, idx) => (
                                    <th key={idx}>
                                        {isAdmin ? (
                                            <input value={year} onChange={e => saveYearsDK(yearsDK.map((y, i) => i === idx ? e.target.value : y))} className={styles.inputField} style={{width:'80px'}} />
                                        ) : `Ед. прод. (${year})`}
                                    </th>
                                ))}
                                {isAdmin && <th>Удалить</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {dataDK.map(row => (
                                <tr key={row.id}>
                                    <td>
                                        {isAdmin ? <input value={row.name} onChange={e => saveDK(dataDK.map(d => d.id === row.id ? {...d, name: e.target.value} : d))} className={styles.inputField} /> : row.name}
                                    </td>
                                    <td>
                                        {isAdmin ? <input value={row.reviewYear} onChange={e => saveDK(dataDK.map(d => d.id === row.id ? {...d, reviewYear: e.target.value} : d))} className={styles.inputField} /> : row.reviewYear}
                                    </td>
                                    {yearsDK.map(year => (
                                        <td key={year}>
                                            {isAdmin ? (
                                                <input type="number" value={row.units[year] || 0} onChange={e => saveDK(dataDK.map(d => d.id === row.id ? {...d, units: {...d.units, [year]: parseInt(e.target.value)}} : d))} className={styles.inputField} />
                                            ) : (row.units[year] || 0)}
                                        </td>
                                    ))}
                                    {isAdmin && <td><button onClick={() => saveDK(dataDK.filter(d => d.id !== row.id))}>🗑️</button></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Table 2: Supply */}
            <section style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3>Предприятия поставляющие продукцию ПАО "Газпром"</h3>
                    {isAdmin && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className={styles.secondaryBtn} onClick={() => saveYearsSupply([...yearsSupply, `${parseInt(yearsSupply[yearsSupply.length-1])+1}`])}>+ Год</button>
                            <button className={styles.primaryBtn} onClick={() => saveSupply([...dataSupply, { id: Date.now(), name: 'Новое предприятие', productType: '', values: {} }])}>Добавить предприятие</button>
                        </div>
                    )}
                </div>
                <div className={styles.scrollContainer}>
                    <table className={styles.dashboardTable}>
                        <thead>
                            <tr>
                                <th>Название предприятия</th>
                                <th>Тип продукции</th>
                                {yearsSupply.map((year, idx) => (
                                    <th key={idx}>
                                        {isAdmin ? (
                                            <input value={year} onChange={e => saveYearsSupply(yearsSupply.map((y, i) => i === idx ? e.target.value : y))} className={styles.inputField} style={{width:'80px'}} />
                                        ) : `${year} млн. руб.`}
                                    </th>
                                ))}
                                {isAdmin && <th>Удалить</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {dataSupply.map(row => (
                                <tr key={row.id}>
                                    <td>
                                        {isAdmin ? <input value={row.name} onChange={e => saveSupply(dataSupply.map(d => d.id === row.id ? {...d, name: e.target.value} : d))} className={styles.inputField} /> : row.name}
                                    </td>
                                    <td>
                                        {isAdmin ? <input value={row.productType} onChange={e => saveSupply(dataSupply.map(d => d.id === row.id ? {...d, productType: e.target.value} : d))} className={styles.inputField} /> : row.productType}
                                    </td>
                                    {yearsSupply.map(year => (
                                        <td key={year}>
                                            {isAdmin ? (
                                                <input type="number" value={row.values[year] || 0} onChange={e => saveSupply(dataSupply.map(d => d.id === row.id ? {...d, values: {...d.values, [year]: parseInt(e.target.value)}} : d))} className={styles.inputField} />
                                            ) : (row.values[year] || 0)}
                                        </td>
                                    ))}
                                    {isAdmin && <td><button onClick={() => saveSupply(dataSupply.filter(d => d.id !== row.id))}>🗑️</button></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Charts Section */}
            <div className={styles.chartsGrid}>
                {/* 1. Supply Chart */}
                <div className={styles.chartCard}>
                    <h4>Поставки продукции для ПАО Газпром по годам</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', height: '200px', alignItems: 'flex-end', marginTop: '2rem' }}>
                        {supplyStats.filter(s => s.sum > 0).map(s => (
                            <div key={s.year} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '2px' }}>{s.sum}</span>
                                <div style={{ width: '100%', background: 'var(--primary-blue)', height: `${(s.sum / maxSupply) * 100}%`, borderRadius: '4px 4px 0 0' }} />
                                <span style={{ fontSize: '0.6rem', marginTop: '4px' }}>{s.year}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Product Type Pie Chart */}
                <div className={styles.chartCard}>
                    <h4>Доли типов продукции в поставках</h4>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
                        <div style={{ 
                            width: '150px', height: '150px', borderRadius: '50%', 
                            background: `conic-gradient(#3b82f6 0% ${typeStats[0]?.percent || 0}%, #10b981 ${typeStats[0]?.percent || 0}% 100%)` 
                        }} />
                        <div>
                            {typeStats.map((st, i) => (
                                <p key={i} style={{ fontSize: '0.9rem' }}>
                                    <span style={{ display: 'inline-block', width: '10px', height: '10px', background: i === 0 ? '#3b82f6' : '#10b981', marginRight: '5px' }} />
                                    {st.type}: <strong>{st.percent}%</strong> ({st.count})
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Roadmap (DK) Dual Axis Chart */}
                <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
                    <h4>Предприятия, рассмотренные по ДК (Кол-во и Ед. продукции)</h4>
                    <div style={{ display: 'flex', gap: '1rem', height: '250px', alignItems: 'flex-end', marginTop: '2rem', borderBottom: '1px solid #ddd' }}>
                        {dkStats.filter(s => s.count > 0 || s.units > 0).map(s => (
                            <div key={s.year} style={{ flex: 1, display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end' }}>
                                <div style={{ width: '45%', background: '#6366f1', height: `${(s.count / maxDKCount) * 100}%`, position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '-15px', width:'100%', textAlign:'center', fontSize: '0.6rem' }}>{s.count}</span>
                                </div>
                                <div style={{ width: '45%', background: '#f59e0b', height: `${(s.units / maxDKUnits) * 100}%`, position: 'relative' }}>
                                    <span style={{ position: 'absolute', top: '-15px', width:'100%', textAlign:'center', fontSize: '0.6rem' }}>{s.units}</span>
                                </div>
                                <span style={{ position: 'absolute', transform: 'translateY(1.5rem)', width: '100%', textAlign: 'center', fontSize: '0.7rem' }}>{s.year}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2.5rem' }}>
                        <span><span style={{ display:'inline-block', width:'10px', height:'10px', background:'#6366f1', marginRight:'5px'}} />Кол-во предприятий</span>
                        <span><span style={{ display:'inline-block', width:'10px', height:'10px', background:'#f59e0b', marginRight:'5px'}} />Единиц продукции</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
