import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
let nextTaskId = 4;
// 任務資料操作：新增、完成、刪除、篩選與統計。
const initialTasks = () => [
    { id: '1', title: '完成 Web App 實作', completed: false },
    { id: '2', title: '完成 JavaScript 練習', completed: false },
    { id: '3', title: '完成課程作業', completed: true },
];
function addTask(tasks, title, id = String(nextTaskId++)) {
    const trimmed = title.trim();
    if (!trimmed)
        throw new Error('請先輸入任務名稱。');
    return [...tasks, { id, title: trimmed, completed: false }];
}
const toggleTask = (tasks, id) => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
const deleteTask = (tasks, id) => tasks.filter(t => t.id !== id);
const filterTasks = (tasks, filter) => tasks.filter(t => filter === 'all' || (filter === 'completed' ? t.completed : !t.completed));
function countTasks(tasks) {
    const completed = tasks.filter(t => t.completed).length;
    return { total: tasks.length, active: tasks.length - completed, completed };
}
function TaskManager() {
    const [tasks, setTasks] = useState(initialTasks);
    const [title, setTitle] = useState('');
    const [filter, setFilter] = useState('all');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const input = useRef(null);
    const counts = countTasks(tasks);
    const visible = filterTasks(tasks, filter);
    const percent = counts.total ? Math.round(counts.completed / counts.total * 100) : 0;
    function submit(event) {
        event.preventDefault();
        if (!title.trim()) {
            setError(true);
            setMessage('請先輸入任務名稱。');
            input.current?.focus();
            return;
        }
        setTasks(previous => addTask(previous, title));
        setTitle('');
        setFilter('all');
        setError(false);
        setMessage('已新增任務。');
        input.current?.focus();
    }
    return <>
    <header className="topbar"><a className="brand" href="./index.html"><span className="brand-icon" aria-hidden="true">✓</span> TASKSPACE</a><span className="top-caption">一件一件，完成每一天。</span></header>
    <main className="workspace">
      <div className="heading"><div><p className="eyebrow">我的工作空間</p><h1>My Task Manager<span className="heading-dot">.</span></h1></div><nav className="versions" aria-label="實作版本"><a href="./index.html">JavaScript</a><a className="current" aria-current="page" href="./react.html">React</a></nav></div>
      <div className="workspace-grid"><div className="task-panel">
        <section className="composer" aria-labelledby="add-heading"><h2 id="add-heading">下一件要完成的事</h2><form onSubmit={submit} noValidate><label htmlFor="task-input">新增任務</label><div className="input-row"><input ref={input} id="task-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="輸入任務名稱…" autoComplete="off" aria-describedby="message" aria-invalid={error || undefined}/><button type="submit" className="add-button"><span aria-hidden="true">＋</span> 新增</button></div><p id="message" className={`message${error ? ' error' : ''}`} role="status" aria-live="polite">{message}</p></form></section>
        {/* 語意化清單：section 描述區域，ul/li 描述各項任務。 */}
        <section className="list-section" aria-labelledby="list-heading"><div className="list-top"><h2 id="list-heading">任務清單</h2><span className="subtle">{visible.length} 項任務</span></div><div className="filters" role="group" aria-label="篩選任務">{[['all', '全部', counts.total], ['active', '未完成', counts.active], ['completed', '已完成', counts.completed]].map(([key, label, count]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(String(key))}>{label} <span>{count}</span></button>)}</div>
          <ul className="task-list">{visible.map(task => <li key={task.id} className={`task-item${task.completed ? ' completed' : ''}`}>
            <label className="task-label"><input type="checkbox" checked={task.completed} onChange={() => { setTasks(previous => toggleTask(previous, task.id)); setError(false); setMessage(task.completed ? '已恢復為未完成。' : '已完成一項任務。'); }} aria-label={task.title}/><span>{task.title}</span></label>
            <button type="button" className="delete-button" aria-label={`刪除 ${task.title}`} onClick={() => { setTasks(previous => deleteTask(previous, task.id)); setError(false); setMessage('已刪除任務。'); input.current?.focus(); }}>刪除</button>
          </li>)}</ul>
          {!visible.length && <div className="empty-state"><span aria-hidden="true">✓</span><h3>{tasks.length ? '目前沒有符合的任務' : '這裡還沒有任務'}</h3><p>{tasks.length ? '切換篩選，看看其他任務。' : '新增一項任務，從一件小事開始。'}</p></div>}
        </section>
        <footer className="task-stats" aria-live="polite">共 {counts.total} 項　 ·　 未完成 {counts.active} 項　 ·　 已完成 {counts.completed} 項</footer>
      </div><aside className="overview" aria-labelledby="overview-heading"><p className="eyebrow">一步一步，向前</p><h2 id="overview-heading">每個完成，都算數。</h2><div className="progress-ring" style={{ '--progress': `${percent}%` }}><div><strong>{percent}<span>%</span></strong><span className="ring-caption">完成進度</span></div></div><dl className="overview-counts"><div><dt><i className="legend active"/>待完成</dt><dd>{counts.active}</dd></div><div><dt><i className="legend done"/>已完成</dt><dd>{counts.completed}</dd></div></dl><p className="overview-note">專注眼前的一件事。<br />完成後，記得為自己打個勾。</p></aside></div>
      <div className="page-footer"><span>MY TASK MANAGER</span><p>任務僅保留於本次使用，重新整理會回到示範資料。</p></div>
    </main>
  </>;
}
createRoot(document.getElementById("root")).render(<TaskManager />);
