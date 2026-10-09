'use client';

import { useState, useEffect } from 'react';
import styles from './RatingManager.module.css';

interface RatingItem {
  id: number;
  image: string; // Base64
  text1: string;
  text2: string;
  rank?: number | null; // 1, 2, 3 or null
}

export default function RatingManager() {
  const [items, setItems] = useState<RatingItem[]>([]);
  const [image, setImage] = useState('');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [rank, setRank] = useState<number | ''>(''); // Selection

  useEffect(() => {
    const stored = localStorage.getItem('innovation_rating');
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const saveItems = (newItems: RatingItem[]) => {
    setItems(newItems);
    localStorage.setItem('innovation_rating', JSON.stringify(newItems));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Check if rank is already taken, if so, ask to overwrite? or just overwrite?
    // User logic: "Fill 1st, 2nd, 3rd". 
    // Simplified: If adding rank 1, clear rank 1 from other items.
    let currentItems = [...items];
    const newRank = rank ? Number(rank) : null;

    if (newRank) {
      currentItems = currentItems.map(i => i.rank === newRank ? { ...i, rank: null } : i);
    }

    const newItem: RatingItem = {
      id: Date.now(),
      image,
      text1,
      text2,
      rank: newRank
    };
    saveItems([...currentItems, newItem]);

    // Reset form
    setImage('');
    setText1('');
    setText2('');
    setRank('');
    alert('Элемент рейтинга добавлен!');
  };

  const deleteItem = (id: number) => {
    if (confirm('Удалить этот элемент?')) {
      saveItems(items.filter(i => i.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <h2>Управление Рейтингом</h2>
      <form onSubmit={addItem} className={styles.form} style={{ marginBottom: '2rem' }}>
        <div className={styles.field}>
          <label>Изображение:</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setImage(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
          {image && <img src={image} alt="Preview" style={{ height: '100px', width: 'auto', marginTop: '10px' }} />}
        </div>
        <div className={styles.field}>
          <label>Занятое Место (Необязательно):</label>
          <select value={rank} onChange={e => setRank(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Без места (Общий список)</option>
            <option value="1">1 место</option>
            <option value="2">2 место</option>
            <option value="3">3 место</option>
          </select>
          <small>Если место уже занято, оно будет переназначено новому элементу.</small>
        </div>
        <div className={styles.field}>
          <label>Текстовый блок 1:</label>
          <textarea value={text1} onChange={e => setText1(e.target.value)} required rows={3} />
        </div>
        <div className={styles.field}>
          <label>Текстовый блок 2:</label>
          <textarea value={text2} onChange={e => setText2(e.target.value)} required rows={3} />
        </div>
        <button type="submit" className={styles.submitButton}>Добавить в рейтинг</button>
      </form>

      <div className={styles.list}>
        <h3>Текущий рейтинг</h3>
        {items.length === 0 && <p>Список пуст</p>}
        {items.map(item => (
          <div key={item.id} className={styles.item}>
            <img src={item.image} alt="Rating Item" className={styles.itemImage} />
            <div className={styles.itemContent}>
              {item.rank && <div style={{ fontWeight: 'bold', color: 'var(--primary-blue)', marginBottom: '0.5rem' }}>🏆 {item.rank} место</div>}
              <p><strong>Блок 1:</strong> {item.text1}</p>
              <p><strong>Блок 2:</strong> {item.text2}</p>
            </div>
            <button onClick={() => deleteItem(item.id)} className={styles.deleteBtn}>Удалить</button>
          </div>
        ))}
      </div>
    </div>
  );
}
