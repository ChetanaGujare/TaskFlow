// ============================================
// Flask CRUD Todo — Frontend JavaScript
// ============================================

const API_BASE = 'http://localhost:5000/api';
let token = localStorage.getItem('token') || null;

// ---------- DOM refs ----------
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const reviewBtn = document.getElementById('reviewBtn');
const totalCount = document.getElementById('totalCount');
const doneCount = document.getElementById('doneCount');
const pendingCount = document.getElementById('pendingCount');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const progressRing = document.getElementById('progressRing');
const focusPending = document.getElementById('focusPending');
const focusBadge = document.getElementById('focusBadge');
const reviewBadge = document.getElementById('reviewBadge');
const themeToggle = document.getElementById('themeToggle');
const dateDisplay = document.querySelector('#dateDisplay span');

// Auth modal elements
const authModal = document.getElementById('authModal');
const authTitle = document.getElementById('authTitle');
const authUsername = document.getElementById('authUsername');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authSubmit = document.getElementById('authSubmit');
const authSwitchLink = document.getElementById('authSwitchLink');
const authSwitchText = document.getElementById('authSwitchText');
const authClose = document.getElementById('authClose');

// ---------- State ----------
let tasks = [];
let currentFilter = 'all';
let isRegisterMode = false;
const circumference = 2 * Math.PI * 28;

// ---------- Utilities ----------
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ---------- Theme ----------
function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ---------- Auth Modal ----------
function showAuthModal() {
    authModal.style.display = 'flex';
    if (isRegisterMode) {
        authTitle.textContent = 'Register';
        authEmail.style.display = 'block';
        authSubmit.textContent = 'Register';
        authSwitchText.textContent = 'Already have an account?';
        authSwitchLink.textContent = 'Login';
    } else {
        authTitle.textContent = 'Login';
        authEmail.style.display = 'none';
        authSubmit.textContent = 'Login';
        authSwitchText.textContent = "Don't have an account?";
        authSwitchLink.textContent = 'Register';
    }
}

function closeAuthModal() {
    authModal.style.display = 'none';
    authUsername.value = '';
    authEmail.value = '';
    authPassword.value = '';
}

authSwitchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    showAuthModal();
});

authSubmit.addEventListener('click', async () => {
    const username = authUsername.value.trim();
    const password = authPassword.value.trim();
    const email = authEmail.value.trim();

    if (isRegisterMode) {
        if (!username || !email || !password) return alert('All fields required');
        await register(username, email, password);
    } else {
        if (!username || !password) return alert('Username and password required');
        await login(username, password);
    }
});

authClose.addEventListener('click', closeAuthModal);

// ---------- API Calls (Auth) ----------
async function login(username, password) {
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
        token = data.token;
        localStorage.setItem('token', token);
        closeAuthModal();
        await fetchTodos();
    } else {
        alert('Login failed: ' + data.error);
    }
}

async function register(username, email, password) {
    const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.success) {
        token = data.token;
        localStorage.setItem('token', token);
        closeAuthModal();
        await fetchTodos();
    } else {
        alert('Registration failed: ' + data.error);
    }
}

function logout() {
    token = null;
    localStorage.removeItem('token');
    tasks = [];
    render();
    showAuthModal();
}

// ---------- API Calls (Todos) ----------
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
                completed: t.completed === 1,
                created_at: t.created_at
            }));
            render();
        } else {
            alert('API Error: ' + json.error);
        }
    } catch (err) {
        console.error(err);
        alert('Cannot connect to Flask server. Make sure it is running on port 5000.');
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
        if (json.success) {
            await fetchTodos();
        } else {
            alert('Error: ' + json.error);
        }
    } catch (err) {
        alert('Network error: ' + err.message);
    }
}

async function toggleTask(id) {
    if (!token) return showAuthModal();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    try {
        const res = await fetch(`${API_BASE}/todos/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ completed: newCompleted })
        });
        if (res.status === 401) return logout();
        const json = await res.json();
        if (json.success) {
            await fetchTodos();
        } else {
            alert('Error: ' + json.error);
        }
    } catch (err) {
        alert('Network error: ' + err.message);
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
        if (json.success) {
            await fetchTodos();
        } else {
            alert('Error: ' + json.error);
        }
    } catch (err) {
        alert('Network error: ' + err.message);
    }
}

async function clearAllTasks() {
    if (!token) return showAuthModal();
    if (tasks.length === 0) return;
    if (!confirm('Delete ALL tasks?')) return;
    for (const t of tasks) {
        await fetch(`${API_BASE}/todos/${t.id}`, { method: 'DELETE', headers: authHeaders() });
    }
    await fetchTodos();
}

// ---------- Render ----------
function render() {
    let filtered = tasks;
    if (currentFilter === 'done') filtered = tasks.filter(t => t.completed);
    else if (currentFilter === 'pending') filtered = tasks.filter(t => !t.completed);

    const sorted = [...filtered].sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);

    if (sorted.length === 0) {
        const msg = currentFilter === 'done' ? 'No completed tasks yet.' :
                    currentFilter === 'pending' ? 'All tasks are completed! 🎉' :
                    'No tasks yet — add one above!';
        taskList.innerHTML = `
            <div class="empty">
                <i class="far fa-smile"></i>
                <p>${msg}</p>
            </div>
        `;
    } else {
        let html = '';
        sorted.forEach(task => {
            const checked = task.completed ? 'done' : '';
            const titleClass = task.completed ? 'completed' : '';
            const badgeClass = task.completed ? 'done' : 'pending';
            const badgeText = task.completed ? 'Done' : 'In Progress';
            html += `
                <div class="task-item" data-id="${task.id}">
                    <div class="check ${checked}" data-id="${task.id}">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="info">
                        <div class="title ${titleClass}">
                            ${escapeHtml(task.title)}
                            <span class="badge ${badgeClass}">${badgeText}</span>
                        </div>
                        ${task.description ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(task.description)}</div>` : ''}
                    </div>
                    <button class="delete" data-id="${task.id}" title="Delete"><i class="fas fa-times"></i></button>
                </div>
            `;
        });
        taskList.innerHTML = html;
    }

    // Update stats
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    totalCount.textContent = total;
    doneCount.textContent = done;
    pendingCount.textContent = pending;
    progressFill.style.width = pct + '%';
    progressPercent.textContent = pct + '%';
    focusPending.textContent = pending;
    focusBadge.innerHTML = `<i class="fas fa-arrow-right"></i> ${pending} remaining`;
    reviewBadge.textContent = `${done}/${total}`;

    // Progress ring
    const offset = circumference - (pct / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

// ---------- Event Listeners ----------
addBtn.addEventListener('click', async () => {
    const val = taskInput.value.trim();
    if (!val) {
        taskInput.style.borderColor = '#ef4444';
        setTimeout(() => taskInput.style.borderColor = '', 400);
        return;
    }
    await addTask(val);
    taskInput.value = '';
    taskInput.focus();
});

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

taskList.addEventListener('click', (e) => {
    const check = e.target.closest('.check');
    if (check) {
        const id = parseInt(check.dataset.id);
        if (id) toggleTask(id);
        return;
    }
    const del = e.target.closest('.delete');
    if (del) {
        const id = parseInt(del.dataset.id);
        if (id) deleteTask(id);
        return;
    }
    const titleEl = e.target.closest('.title');
    if (titleEl) {
        const item = titleEl.closest('.task-item');
        if (item) {
            const id = parseInt(item.dataset.id);
            if (id) toggleTask(id);
        }
    }
});

clearBtn.addEventListener('click', clearAllTasks);

reviewBtn.addEventListener('click', () => {
    const done = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    if (total === 0) alert('📝 No tasks yet. Add some to get started!');
    else if (done === total) alert('🎉 Amazing! You\'ve completed all tasks!');
    else alert(`📊 You've completed ${done} out of ${total} tasks. Keep going! 💪`);
});

document.querySelectorAll('.tabs button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const id = this.id;
        if (id === 'tabAll') currentFilter = 'all';
        else if (id === 'tabPending') currentFilter = 'pending';
        else if (id === 'tabDone') currentFilter = 'done';
        render();
    });
});

themeToggle.addEventListener('click', toggleTheme);

function setDate() {
    const now = new Date();
    if (dateDisplay) {
        dateDisplay.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
    }
}

// ---------- Init ----------
loadTheme();
setDate();

if (token) {
    fetchTodos();
} else {
    showAuthModal();
}

taskInput.focus();