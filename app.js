// ============================================
// TaskFlow — Frontend JS (Bootstrap 5)
// ============================================

// Configurable API base URL (environment-friendly)
const API_BASE = window.API_BASE || 'http://localhost:5000/api';

let token = localStorage.getItem('token') || null;
let tasks = [];
let currentFilter = 'all';
let isRegisterMode = false;
let authModalInstance = null;
const circumference = 2 * Math.PI * 28;

// ---------- DOM refs ----------
const taskListEl   = document.getElementById('taskList');
const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const clearBtn     = document.getElementById('clearBtn');
const reviewBtn    = document.getElementById('reviewBtn');
const logoutBtn    = document.getElementById('logoutBtn');
const themeToggle  = document.getElementById('themeToggle');

const totalCountEl   = document.getElementById('totalCount');
const doneCountEl    = document.getElementById('doneCount');
const pendingCountEl = document.getElementById('pendingCount');
const progressFill   = document.getElementById('progressFill');
const progressPercent= document.getElementById('progressPercent');
const progressRing   = document.getElementById('progressRing');
const focusPending   = document.getElementById('focusPending');
const reviewBadge    = document.getElementById('reviewBadge');
const dateDisplay    = document.getElementById('dateDisplay');

// Auth modal
const authUsername   = document.getElementById('authUsername');
const authEmail      = document.getElementById('authEmail');
const emailGroup     = document.getElementById('emailGroup');
const authPassword   = document.getElementById('authPassword');
const authSubmit     = document.getElementById('authSubmit');
const authTitle      = document.getElementById('authTitle');
const authSwitchLink = document.getElementById('authSwitchLink');
const authSwitchText = document.getElementById('authSwitchText');

// ---------- Utilities ----------
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function showError(msg) {
    // Simple user-friendly error
    alert('⚠️ ' + msg);
}

// ---------- Auth Modal ----------
function showAuthModal() {
    if (!authModalInstance) {
        authModalInstance = new bootstrap.Modal(document.getElementById('authModal'));
    }
    authModalInstance.show();
}
function hideAuthModal() {
    if (authModalInstance) authModalInstance.hide();
}

authSwitchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    authTitle.textContent = isRegisterMode ? 'Register' : 'Login';
    emailGroup.style.display = isRegisterMode ? 'block' : 'none';
    authSubmit.textContent = isRegisterMode ? 'Register' : 'Login';
    authSwitchText.textContent = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
    authSwitchLink.textContent = isRegisterMode ? 'Login' : 'Register';
});

authSubmit.addEventListener('click', async () => {
    const username = authUsername.value.trim();
    const password = authPassword.value.trim();
    const email    = authEmail.value.trim();

    if (isRegisterMode) {
        if (!username || !email || !password) return showError('All fields required');
        await register(username, email, password);
    } else {
        if (!username || !password) return showError('Username and password required');
        await login(username, password);
    }
});

// ---------- API: Auth ----------
async function login(username, password) {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            hideAuthModal();
            logoutBtn.classList.remove('d-none');
            await fetchTodos();
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

async function register(username, email, password) {
    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            hideAuthModal();
            logoutBtn.classList.remove('d-none');
            await fetchTodos();
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

function logout() {
    token = null;
    localStorage.removeItem('token');
    tasks = [];
    render();
    logoutBtn.classList.add('d-none');
    isRegisterMode = false;
    authTitle.textContent = 'Login';
    emailGroup.style.display = 'none';
    authSubmit.textContent = 'Login';
    showAuthModal();
}

logoutBtn.addEventListener('click', logout);

// ---------- API: Todos ----------
async function fetchTodos() {
    if (!token) return showAuthModal();
    try {
        const res = await fetch(`${API_BASE}/todos`, { headers: authHeaders() });
        if (res.status === 401) return logout();
        const json = await res.json();
        if (json.success) {
            tasks = json.data.map(t => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                completed: t.completed === 1
            }));
            render();
        } else {
            showError(json.error || 'Failed to load tasks');
        }
    } catch (err) {
        showError('Cannot connect to server. Is Flask running on port 5000?');
    }
}

async function addTask(title) {
    if (!token) return showAuthModal();
    try {
        const res = await fetch(`${API_BASE}/todos`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ title, description: '', completed: false })
        });
        if (res.status === 401) return logout();
        const json = await res.json();
        if (json.success) await fetchTodos();
        else showError(json.error || 'Failed to add task');
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

async function toggleTask(id) {
    if (!token) return showAuthModal();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    try {
        const res = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ completed: !task.completed })
        });
        if (res.status === 401) return logout();
        const json = await res.json();
        if (json.success) await fetchTodos();
        else showError(json.error || 'Failed to update task');
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

async function deleteTask(id) {
    if (!token) return showAuthModal();
    if (!confirm('Delete this task?')) return;
    try {
        const res = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        if (res.status === 401) return logout();
        const json = await res.json();
        if (json.success) await fetchTodos();
        else showError(json.error || 'Failed to delete task');
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

async function clearAllTasks() {
    if (!token) return showAuthModal();
    if (tasks.length === 0) return;
    if (!confirm('Delete ALL tasks?')) return;
    try {
        for (const t of tasks) {
            await fetch(`${API_BASE}/todos/${t.id}`, { method: 'DELETE', headers: authHeaders() });
        }
        await fetchTodos();
    } catch (err) {
        showError('Network error: ' + err.message);
    }
}

// ---------- Render ----------
function render() {
    let filtered = tasks;
    if (currentFilter === 'done') filtered = tasks.filter(t => t.completed);
    else if (currentFilter === 'pending') filtered = tasks.filter(t => !t.completed);

    const sorted = [...filtered].sort((a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    if (sorted.length === 0) {
        const msg = currentFilter === 'done' ? 'No completed tasks yet.' :
                    currentFilter === 'pending' ? 'All tasks are completed! 🎉' :
                    'No tasks yet — add one above!';
        taskListEl.innerHTML = `
            <li class="list-group-item text-center text-muted py-5">
                <i class="far fa-smile fs-2 d-block mb-2"></i>
                <p class="mb-0">${msg}</p>
            </li>`;
    } else {
        taskListEl.innerHTML = sorted.map(task => {
            const checked = task.completed ? 'done' : '';
            const titleClass = task.completed ? 'task-done' : '';
            const badge = task.completed
                ? '<span class="badge bg-success ms-2">Done</span>'
                : '<span class="badge bg-warning text-dark ms-2">In Progress</span>';
            return `
                <li class="list-group-item d-flex align-items-center gap-3" data-id="${task.id}">
                    <div class="form-check m-0">
                        <input class="form-check-input task-check" type="checkbox" ${task.completed ? 'checked' : ''}
                               data-id="${task.id}" style="cursor:pointer; width:20px; height:20px;" />
                    </div>
                    <div class="flex-grow-1">
                        <span class="fw-semibold ${titleClass}">${escapeHtml(task.title)}</span>${badge}
                        ${task.description ? `<div class="small text-muted">${escapeHtml(task.description)}</div>` : ''}
                    </div>
                    <button class="btn btn-sm btn-outline-danger task-delete" data-id="${task.id}" title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </li>`;
        }).join('');
    }

    // Stats
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    totalCountEl.textContent   = total;
    doneCountEl.textContent    = done;
    pendingCountEl.textContent = pending;
    progressFill.style.width   = pct + '%';
    progressPercent.textContent= pct + '%';
    focusPending.textContent   = pending;
    reviewBadge.textContent    = `${done}/${total}`;
    progressRing.style.strokeDashoffset = circumference - (pct / 100) * circumference;
}

// ---------- Event Listeners (CRUD) ----------
addBtn.addEventListener('click', async () => {
    const val = taskInput.value.trim();
    if (!val) {
        taskInput.classList.add('is-invalid');
        setTimeout(() => taskInput.classList.remove('is-invalid'), 500);
        return;
    }
    await addTask(val);
    taskInput.value = '';
    taskInput.focus();
});

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

// Event delegation for checkboxes & delete buttons
taskListEl.addEventListener('click', (e) => {
    const check = e.target.closest('.task-check');
    if (check) {
        toggleTask(parseInt(check.dataset.id));
        return;
    }
    const del = e.target.closest('.task-delete');
    if (del) {
        deleteTask(parseInt(del.dataset.id));
    }
});

clearBtn.addEventListener('click', clearAllTasks);

reviewBtn.addEventListener('click', () => {
    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    if (total === 0) showError('No tasks yet. Add some to get started!');
    else if (done === total) alert('🎉 Amazing! You\'ve completed all tasks!');
    else alert(`📊 You've completed ${done} out of ${total} tasks. Keep going! 💪`);
});

// Tabs (Bootstrap nav-pills)
document.querySelectorAll('.nav-pills button').forEach(btn => {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.nav-pills button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (this.id === 'tabAll') currentFilter = 'all';
        else if (this.id === 'tabPending') currentFilter = 'pending';
        else if (this.id === 'tabDone') currentFilter = 'done';
        render();
    });
});

// Theme toggle
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ---------- Init ----------
function initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function setDate() {
    const now = new Date();
    if (dateDisplay) {
        dateDisplay.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
    }
}

initTheme();
setDate();

if (token) {
    logoutBtn.classList.remove('d-none');
    fetchTodos();
} else {
    showAuthModal();
}

taskInput.focus();