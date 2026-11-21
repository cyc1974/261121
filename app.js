const STORAGE_KEY = 'simple-todo-list';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const remainingCount = document.getElementById('remaining-count');
const storageMessage = document.getElementById('storage-message');

let todos = loadTodos();

// 從瀏覽器讀取已儲存的清單，並確認資料格式正確。
function loadTodos() {
  try {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (!savedTodos) return [];

    const parsedTodos = JSON.parse(savedTodos);
    if (
      !Array.isArray(parsedTodos) ||
      !parsedTodos.every((todo) =>
        todo &&
        typeof todo.id === 'string' &&
        typeof todo.text === 'string' &&
        typeof todo.completed === 'boolean'
      )
    ) {
      throw new Error('待辦清單資料格式不正確。');
    }

    return parsedTodos;
  } catch (error) {
    console.error('讀取待辦清單失敗。', error);
    showStorageMessage('無法讀取已儲存的待辦事項，請確認瀏覽器允許使用本機儲存空間。');
    return [];
  }
}

// 儲存清單；發生錯誤時在畫面上明確提示。
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    showStorageMessage('');
  } catch (error) {
    console.error('儲存待辦清單失敗。', error);
    showStorageMessage('無法儲存變更，請確認瀏覽器允許使用本機儲存空間。');
  }
}

function showStorageMessage(message) {
  storageMessage.textContent = message;
  storageMessage.hidden = message.length === 0;
}

// 依照目前資料更新待辦清單、空狀態提示與未完成數量。
function render() {
  list.replaceChildren();

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = todo.completed ? 'todo-item completed' : 'todo-item';
    item.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.className = 'todo-checkbox';
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記「${todo.text}」為完成`);

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = '刪除';
    deleteButton.setAttribute('aria-label', `刪除「${todo.text}」`);

    item.append(checkbox, text, deleteButton);
    list.append(item);
  });

  emptyState.hidden = todos.length > 0;
  remainingCount.textContent = `未完成:${todos.filter((todo) => !todo.completed).length} 項`;
}

function createTodoId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  todos.push({ id: createTodoId(), text, completed: false });
  saveTodos();
  render();
  input.value = '';
  input.focus();
});

list.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const item = target.closest('.todo-item');
  if (!item) return;

  const { id } = item.dataset;
  if (!id) return;

  if (target.matches('.btn-delete')) {
    todos = todos.filter((todo) => todo.id !== id);
    saveTodos();
    render();
  } else if (target.matches('.todo-checkbox')) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    render();
  }
});

render();
