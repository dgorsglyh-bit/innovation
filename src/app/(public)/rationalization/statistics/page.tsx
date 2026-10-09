'use client';

import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

// Custom triangle plugin for economics effect
const trianglePlugin = {
    id: 'trianglePlugin',
    afterDatasetsDraw(chart: any) {
        const { ctx, data, scales: { x, y } } = chart;
        if (chart.config.type !== 'line') return;

        data.datasets.forEach((dataset: any, datasetIndex: number) => {
            if (dataset.label === 'Экономический эффект') {
                dataset.data.forEach((value: number, index: number) => {
                    const xPos = x.getPixelForValue(data.labels[index]);
                    const yPos = y.getPixelForValue(value);

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(xPos, yPos - 10);
                    ctx.lineTo(xPos - 8, yPos + 5);
                    ctx.lineTo(xPos + 8, yPos + 5);
                    ctx.closePath();
                    ctx.fillStyle = 'orange';
                    ctx.fill();

                    // Draw value text above triangle
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(value.toString(), xPos, yPos - 15);
                    ctx.restore();
                });
            }
        });
    }
};

ChartJS.register(trianglePlugin);

export default function StatisticsPage() {
    const [retroData, setRetroData] = useState<any[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('innovation_stats_retro');
        if (stored) {
            setRetroData(JSON.parse(stored));
        }
    }, []);

    // 1. Retrospective Chart Data
    const retroChartData = {
        labels: retroData.map(d => d.year),
        datasets: [
            {
                label: 'Количество авторов РП',
                data: retroData.map(d => d.authors),
                borderColor: '#007bff',
                backgroundColor: '#007bff',
                tension: 0.1,
            },
            {
                label: 'Количество зарегистрированных РП',
                data: retroData.map(d => d.registered),
                borderColor: '#28a745',
                backgroundColor: '#28a745',
                tension: 0.1,
            },
            {
                label: 'Количество использованных РП',
                data: retroData.map(d => d.used),
                borderColor: '#dc3545',
                backgroundColor: '#dc3545',
                tension: 0.1,
            },
            {
                label: 'Экономический эффект',
                data: retroData.map(d => d.economicEffect),
                borderColor: 'transparent',
                backgroundColor: 'transparent',
                pointRadius: 0, // Hidden points, triangles drawn by plugin
                showLine: false,
            }
        ],
    };

    // 2. Plan Fulfillment Data (Mock)
    const branches = ['Филиал 1', 'Филиал 2', 'Филиал 3', 'Филиал 4', 'Филиал 5'];
    const planData = [
        { branch: 'Филиал 1', total: 10, done: 0 },
        { branch: 'Филиал 2', total: 12, done: 5 },
        { branch: 'Филиал 3', total: 15, done: 15 },
        { branch: 'Филиал 4', total: 8, done: 12 },
        { branch: 'Филиал 5', total: 20, done: 18 },
    ];

    const planChartData = {
        labels: planData.map(d => d.branch),
        datasets: [
            {
                label: 'Выполнено',
                data: planData.map(d => Math.min(d.done, d.total)),
                backgroundColor: (context: any) => {
                    const index = context.dataIndex;
                    const item = planData[index];
                    if (item.done === 0) return '#dc3545'; // Red
                    if (item.done >= item.total) return '#28a745'; // Green
                    return '#007bff'; // Blue
                },
            },
            {
                label: 'Осталось',
                data: planData.map(d => Math.max(0, d.total - d.done)),
                backgroundColor: '#e9ecef',
            }
        ],
    };

    // 3. Branch Rating Data (Mock)
    const ratingChartData = {
        labels: branches,
        datasets: [
            {
                label: 'Принято РП',
                data: [20, 25, 18, 22, 30],
                backgroundColor: '#007bff',
                yAxisID: 'yUnits',
            },
            {
                label: 'Зарегистрировано РП',
                data: [15, 20, 12, 18, 25],
                backgroundColor: '#28a745',
                yAxisID: 'yUnits',
            },
            {
                label: 'Использовано РП',
                data: [10, 15, 8, 12, 20],
                backgroundColor: '#ffc107',
                yAxisID: 'yUnits',
            },
            {
                label: 'Эк. эффект (млн руб)',
                data: [2.5, 3.8, 1.2, 2.1, 4.5],
                backgroundColor: '#6c757d',
                yAxisID: 'yMoney',
            }
        ],
    };

    return (
        <div className="main-container" style={{ paddingBottom: '4rem' }}>
            <h1>Статистика</h1>

            <section style={{ marginBottom: '4rem' }}>
                <h2>Ретроспектива</h2>
                <div style={{ height: '400px', background: 'white', padding: '1rem', borderRadius: '8px' }}>
                    <Line
                        data={retroChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } },
                        }}
                    />
                </div>
            </section>

            <section style={{ marginBottom: '4rem' }}>
                <h2>Выполнение плана по РП</h2>
                <div style={{ height: '500px', background: 'white', padding: '1rem', borderRadius: '8px' }}>
                    <Bar
                        data={planChartData}
                        options={{
                            indexAxis: 'y',
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: { stacked: true, max: 100, ticks: { callback: (val) => val + '%' } },
                                y: { stacked: true }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: (item: any) => {
                                            const d = planData[item.dataIndex];
                                            const percent = Math.round((d.done / d.total) * 100);
                                            return `${d.done} из ${d.total} (${percent}%)`;
                                        }
                                    }
                                },
                                legend: { display: false }
                            }
                        }}
                    />
                </div>
            </section>

            <section>
                <h2>Рейтинг филиалов</h2>
                <div style={{ height: '500px', background: 'white', padding: '1rem', borderRadius: '8px' }}>
                    <Bar
                        data={ratingChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                yUnits: { type: 'linear', position: 'left', title: { display: true, text: 'Шт.' } },
                                yMoney: { type: 'linear', position: 'right', title: { display: true, text: 'Млн руб.' }, grid: { drawOnChartArea: false } }
                            },
                            plugins: {
                                legend: { position: 'bottom' },
                            }
                        }}
                    />
                </div>
            </section>
        </div>
    );
}
