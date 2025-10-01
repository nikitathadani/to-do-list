let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let taskIdCounter = tasks.length ? Math.max(...tasks.map(t => t.id)) : 0;

// Elements
const taskList = document.getElementById('task-list');
const taskInput = document.getElementById('task-input');
const taskDate = document.getElementById('task-date');
const taskPriority = document.getElementById('task-priority');
const addBtn = document.getElementById('add-btn');
const themeToggle = document.getElementById('theme-toggle');
const searchInput = document.getElementById('search-input');
const filterPriority = document.getElementById('filter-priority');
const filterStatus = document.getElementById('filter-status');

// Theme
if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Add Task
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', e => { if(e.key==='Enter') addTask(); });

function addTask() {
  const text = taskInput.value.trim();
  if(!text) return;

  const newTask = {
    id: ++taskIdCounter,
    text,
    completed: false,
    priority: taskPriority.value,
    date: taskDate.value
  };
  tasks.push(newTask);
  saveAndRender();
  taskInput.value = '';
  taskDate.value = '';
}

// Save to localStorage
function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  updateStats();
}

// Render tasks
function renderTasks() {
  const search = searchInput.value.toLowerCase();
  const priorityFilter = filterPriority.value;
  const statusFilter = filterStatus.value;

  taskList.innerHTML = '';
  const filtered = tasks.filter(t => 
    t.text.toLowerCase().includes(search) &&
    (priorityFilter==='all' || t.priority===priorityFilter) &&
    (statusFilter==='all' || (statusFilter==='pending'? !t.completed : t.completed))
  );

  if(filtered.length===0) {
    document.getElementById('empty-state').style.display='block';
  } else {
    document.getElementById('empty-state').style.display='none';
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className='task-item';
    li.setAttribute('draggable','true');
    li.dataset.id = task.id;
    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" ${task.completed?'checked':''} onchange="toggleTask(${task.id})">
        <span class="task-text ${task.completed?'completed':''}">${task.text} ${task.date?`(Due: ${task.date})`:''}</span>
        <span class="task-priority ${task.priority}">${task.priority}</span>
      </div>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask(${task.id})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  initDragAndDrop();
}

// Toggle complete
function toggleTask(id) {
  const task = tasks.find(t=>t.id===id);
  task.completed = !task.completed;
  saveAndRender();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(t=>t.id!==id);
  saveAndRender();
}

// Edit task
function editTask(id) {
  const task = tasks.find(t=>t.id===id);
  const newText = prompt('Edit task:', task.text);
  if(newText) {
    task.text = newText;
    saveAndRender();
  }
}

// Search and filters
searchInput.addEventListener('input', renderTasks);
filterPriority.addEventListener('change', renderTasks);
filterStatus.addEventListener('change', renderTasks);

// Stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t=>t.completed).length;
  const remaining = total - completed;
  document.getElementById('total-count').textContent = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('remaining-count').textContent = remaining;
  document.getElementById('progress-fill').style.width = total?`${(completed/total)*100}%`:'0%';
}

// Drag and drop
function initDragAndDrop() {
  const items = document.querySelectorAll('.task-item');
  items.forEach(item=>{
    item.addEventListener('dragstart', dragStart);
    item.addEventListener('dragover', dragOver);
    item.addEventListener('drop', drop);
  });
}

let draggedId = null;
function dragStart(e) { draggedId = e.target.dataset.id; }
function dragOver(e){ e.preventDefault(); }
function drop(e){
  const targetId = e.target.closest('.task-item').dataset.id;
  const draggedIndex = tasks.findIndex(t=>t.id==draggedId);
  const targetIndex = tasks.findIndex(t=>t.id==targetId);
  tasks.splice(targetIndex,0,tasks.splice(draggedIndex,1)[0]);
  saveAndRender();
}

// Initialize
renderTasks();
