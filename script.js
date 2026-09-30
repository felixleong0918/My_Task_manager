let nextTaskId = 4;
// 任務資料操作：新增、完成、刪除、篩選與統計。
const initialTasks = () => [
  { id: '1', title: '完成 Web App 實作', completed: false },
  { id: '2', title: '完成 JavaScript 練習', completed: false },
  { id: '3', title: '完成課程作業', completed: true },
];
function addTask(tasks, title, id = String(nextTaskId++)) {
  const trimmed = title.trim();
  if (!trimmed) throw new Error('請先輸入任務名稱。');
  return [...tasks, { id, title: trimmed, completed: false }];
}
const toggleTask = (tasks, id) => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
const deleteTask = (tasks, id) => tasks.filter(t => t.id !== id);
const filterTasks = (tasks, filter) => tasks.filter(t => filter === 'all' || (filter === 'completed' ? t.completed : !t.completed));
function countTasks(tasks) {
  const completed = tasks.filter(t => t.completed).length;
  return { total: tasks.length, active: tasks.length - completed, completed };
}

let tasks = initialTasks(); // 1. tasks 陣列保存所有任務。
let currentFilter = 'all';
const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const message = document.querySelector('#message');
const list = document.querySelector('#task-list');

form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    tasks = addTask(tasks, input.value); // 2. 檢查空白並新增任務。
    currentFilter = 'all';
    input.value = '';
    input.removeAttribute('aria-invalid');
    message.textContent = '已新增任務。';
    message.classList.remove('error');
    render(); // 3. 更新清單、篩選狀態與統計。
  } catch (error) {
    message.textContent = error.message;
    message.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
  }
  input.focus();
});

function announce(text) {
  message.textContent = text;
  message.classList.remove('error');
}
function render() {
  const counts = countTasks(tasks);
  const visible = filterTasks(tasks, currentFilter);
  list.replaceChildren();
  visible.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' completed' : ''}`;
    const label = document.createElement('label');
    label.className = 'task-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => {
      tasks = toggleTask(tasks, task.id);
      announce(task.completed ? '已恢復為未完成。' : '已完成一項任務。');
      render();
      const next = list.querySelector(`[data-task-id="${task.id}"] input`) || document.querySelector(`[data-filter="${currentFilter}"]`);
      next?.focus();
    });
    const title = document.createElement('span');
    title.textContent = task.title; // 安全呈現文字，不將使用者輸入當成 HTML。
    label.append(checkbox, title);
    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.textContent = '刪除';
    remove.setAttribute('aria-label', `刪除 ${task.title}`);
    remove.addEventListener('click', () => {
      const index = [...list.children].indexOf(item);
      tasks = deleteTask(tasks, task.id);
      announce('已刪除任務。');
      render();
      (list.children[Math.min(index, list.children.length - 1)]?.querySelector('.delete-button') || input).focus();
    });
    item.dataset.taskId = task.id;
    item.append(label, remove);
    list.append(item);
  });
  document.querySelector('#empty-state').hidden = visible.length !== 0;
  document.querySelector('#empty-state h3').textContent = tasks.length ? '目前沒有符合的任務' : '這裡還沒有任務';
  document.querySelector('#empty-state p').textContent = tasks.length ? '切換篩選，看看其他任務。' : '新增一項任務，從一件小事開始。';
  document.querySelector('#visible-count').textContent = `${visible.length} 項任務`;
  document.querySelectorAll('[data-count]').forEach(el => { el.textContent = counts[el.dataset.count]; });
  document.querySelectorAll('[data-filter]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.filter === currentFilter)); });
  document.querySelector('#task-stats').textContent = `共 ${counts.total} 項　 ·　 未完成 ${counts.active} 項　 ·　 已完成 ${counts.completed} 項`;
  const percent = counts.total ? Math.round(counts.completed / counts.total * 100) : 0;
  document.querySelector('#percentage').replaceChildren(document.createTextNode(String(percent)), Object.assign(document.createElement('span'), {textContent: '%'}));
  document.querySelector('#progress-ring').style.setProperty('--progress', `${percent}%`);
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  render();
}));
render();

