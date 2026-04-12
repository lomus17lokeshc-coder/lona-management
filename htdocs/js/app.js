/*  ================================================
    LONA LIBRARY – app.js
    Mock-backend version: reads/writes to
    mock_server.js (Node) OR falls back to
    localStorage when server is unavailable.
    ================================================ */

const API = 'http://localhost:3000/cgi-bin';

/* ─── Seed Data ─── */
const SEED_BOOKS = [
    { id:1,  title:"Database System Concepts",       author:"Silberschatz & Korth", category:"DBMS",        dept:"CS",  sem:4, qty:5, issued:2 },
    { id:2,  title:"Operating System Concepts",      author:"Abraham Silberschatz", category:"OS",          dept:"CS",  sem:5, qty:4, issued:4 },
    { id:3,  title:"Data Structures using C",        author:"Reema Thareja",        category:"DS",          dept:"CS",  sem:3, qty:6, issued:1 },
    { id:4,  title:"Higher Engineering Mathematics", author:"B.S. Grewal",          category:"Maths",       dept:"All", sem:2, qty:8, issued:3 },
    { id:5,  title:"Computer Networks",              author:"Andrew Tanenbaum",     category:"Networks",    dept:"CS",  sem:6, qty:3, issued:1 },
    { id:6,  title:"Introduction to Algorithms",     author:"Cormen et al.",        category:"DS",          dept:"CS",  sem:4, qty:4, issued:2 },
    { id:7,  title:"Let Us C",                       author:"Yashavant Kanetkar",   category:"Programming", dept:"CS",  sem:1, qty:10,issued:4 },
    { id:8,  title:"Discrete Mathematics",           author:"Kenneth H. Rosen",     category:"Maths",       dept:"All", sem:3, qty:5, issued:0 },
    { id:9,  title:"The Linux Command Line",         author:"William Shotts",       category:"OS",          dept:"CS",  sem:5, qty:2, issued:1 },
    { id:10, title:"DBMS by Navathe",                author:"Elmasri & Navathe",    category:"DBMS",        dept:"CS",  sem:4, qty:3, issued:3 },
];

const SEED_USERS = [
    { id:"STU001", name:"Ananya Sharma",  dept:"Computer Science", sem:4, password:"pass123", photo:"🎓" },
    { id:"STU002", name:"Rohit Verma",    dept:"Electronics",      sem:3, password:"pass123", photo:"👨‍💻" },
    { id:"STU003", name:"Priya Nair",     dept:"Information Tech", sem:5, password:"pass123", photo:"👩‍🎓" },
];

const SEED_ISSUED = [
    { id:"ISS001", studentId:"STU001", bookId:1, issueDate:"2024-03-20", dueDate:"2024-04-03", returned:false },
    { id:"ISS002", studentId:"STU002", bookId:2, issueDate:"2024-03-15", dueDate:"2024-03-29", returned:false },
    { id:"ISS003", studentId:"STU001", bookId:7, issueDate:"2024-03-18", dueDate:"2024-04-01", returned:false },
    { id:"ISS004", studentId:"STU003", bookId:4, issueDate:"2024-03-10", dueDate:"2024-03-24", returned:true  },
];

const ADMINS = [
    { id:"ADM001", password:"admin123" }
];

const SUGGESTIONS = [
    { title:"Clean Code",               author:"Robert C. Martin",   category:"Programming", emoji:"🧹" },
    { title:"The Pragmatic Programmer", author:"Hunt & Thomas",       category:"Programming", emoji:"🔧" },
    { title:"Design Patterns",          author:"Gang of Four",        category:"DS",          emoji:"🏗️" },
    { title:"Head First Python",        author:"Paul Barry",          category:"Programming", emoji:"🐍" },
    { title:"Artificial Intelligence",  author:"Stuart Russell",      category:"DS",          emoji:"🤖" },
    { title:"Computer Organization",    author:"Carl Hamacher",       category:"OS",          emoji:"💾" },
];

/* ─── Storage Helpers ─── */
function getBooks()   { return JSON.parse(localStorage.getItem('ll_books')   || 'null') || SEED_BOOKS.map(b => ({...b})); }
function getUsers()   { return JSON.parse(localStorage.getItem('ll_users')   || 'null') || SEED_USERS.map(u => ({...u})); }
function getIssued()  { return JSON.parse(localStorage.getItem('ll_issued')  || 'null') || SEED_ISSUED.map(i => ({...i})); }

function saveBooks(d)  { localStorage.setItem('ll_books',  JSON.stringify(d)); }
function saveUsers(d)  { localStorage.setItem('ll_users',  JSON.stringify(d)); }
function saveIssued(d) { localStorage.setItem('ll_issued', JSON.stringify(d)); }

/* ─── Fine Calculation ─── */
function calcFine(dueDateStr) {
    const due  = new Date(dueDateStr);
    const now  = new Date();
    const diff = Math.floor((now - due) / 86400000);
    return diff > 0 ? diff * 1 : 0;
}

/* ─── Category Emoji Map ─── */
const CAT_EMOJI = { DBMS:"🗄️", OS:"💻", DS:"📊", Maths:"📐", Networks:"🌐", Programming:"⌨️" };
function bookEmoji(cat) { return CAT_EMOJI[cat] || "📖"; }

/* ─── Notification ─── */
function notify(msg, type = 'success') {
    const el = document.getElementById('globalNotification');
    if (!el) return;
    el.className = `global-notif notif-${type}`;
    el.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
    el.classList.remove('hidden');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.add('hidden'), 4000);
}

/* ─── Logout ─── */
function logout() {
    sessionStorage.removeItem('ll_session');
    window.location.href = 'index.html';
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════ */
function initLoginPage() {
    const role = window.LOGIN_ROLE || 'admin';

    const togglePwd = document.getElementById('togglePwd');
    const pwdInput  = document.getElementById('password');
    if (togglePwd && pwdInput) {
        togglePwd.addEventListener('click', () => {
            pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
            togglePwd.textContent = pwdInput.type === 'password' ? '👁' : '🙈';
        });
    }

    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const userId   = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value;
        const errEl    = document.getElementById('loginError');
        const btnText  = document.getElementById('loginBtnText');
        const spinner  = document.getElementById('loginSpinner');

        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');

        setTimeout(() => {
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');

            if (role === 'admin') {
                const admin = ADMINS.find(a => a.id === userId && a.password === password);
                if (admin) {
                    sessionStorage.setItem('ll_session', JSON.stringify({ role:'admin', id:userId }));
                    window.location.href = 'admin.html';
                } else {
                    errEl.classList.remove('hidden');
                }
            } else {
                const users = getUsers();
                const user  = users.find(u => u.id === userId && u.password === password);
                if (user) {
                    sessionStorage.setItem('ll_session', JSON.stringify({ role:'user', id:userId }));
                    window.location.href = 'user.html';
                } else {
                    errEl.classList.remove('hidden');
                }
            }
        }, 600);
    });
}

/* ═══════════════════════════════════════════════
   SHARED DASHBOARD INIT
   ═══════════════════════════════════════════════ */
function initDashboard(role) {
    const session = JSON.parse(sessionStorage.getItem('ll_session') || 'null');
    if (!session || session.role !== role) {
        window.location.href = 'login.html?role=' + role;
        return;
    }

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
            btn.classList.add('active');
            const vid = btn.getAttribute('data-view');
            const vEl = document.getElementById(vid);
            if (vEl) vEl.classList.add('active-view');
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.textContent = btn.textContent.trim().replace(/^\S+\s*/, '');
            if (role === 'admin')  onAdminNav(vid, session);
            if (role === 'user')   onUserNav(vid, session);
        });
    });

    if (role === 'admin') initAdminDashboard(session);
    if (role === 'user')  initUserDashboard(session);
}

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD
   ═══════════════════════════════════════════════ */
function initAdminDashboard(session) {
    renderAdminStats();
    renderRecentTransactions();
    renderOverdueAlerts();
    renderSuggestions('suggestGrid');
    renderAdminBooksTable();
    setupAddBookForm();
    setupIssueBookForm(session);
    renderPendingTable();

    // Set default due-date (14 days from today)
    const dd = document.getElementById('issueDueDate');
    if (dd) {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        dd.value = d.toISOString().split('T')[0];
    }

    // Books search/filter
    const searchIn = document.getElementById('bookSearchInput');
    const catFilter = document.getElementById('categoryFilter');
    if (searchIn) searchIn.addEventListener('input',  () => renderAdminBooksTable());
    if (catFilter) catFilter.addEventListener('change', () => renderAdminBooksTable());
}

function onAdminNav(viewId, session) {
    if (viewId === 'dash-view')     { renderAdminStats(); renderRecentTransactions(); renderOverdueAlerts(); }
    if (viewId === 'books-view')    renderAdminBooksTable();
    if (viewId === 'pending-view')  renderPendingTable();
    if (viewId === 'suggest-view')  renderSuggestions('suggestGrid');
}

function renderAdminStats() {
    const users  = getUsers();
    const issued = getIssued();
    const total  = issued.length;
    const ret    = issued.filter(i => i.returned).length;
    const pend   = issued.filter(i => !i.returned).length;

    setText('stat-students', users.length);
    setText('stat-issued',   total);
    setText('stat-returned', ret);
    setText('stat-pending',  pend);
}

function renderRecentTransactions() {
    const issued = getIssued();
    const books  = getBooks();
    const users  = getUsers();
    const el     = document.getElementById('recent-transactions');
    if (!el) return;

    const recent = [...issued].reverse().slice(0, 5);
    if (!recent.length) { el.innerHTML = '<p class="empty-state">No transactions yet.</p>'; return; }

    el.innerHTML = recent.map(tr => {
        const book = books.find(b => b.id === tr.bookId) || {};
        const user = users.find(u => u.id === tr.studentId) || {};
        const icon = tr.returned ? '✅' : '📤';
        const status = tr.returned ? 'Returned' : 'Issued';
        return `
        <div class="trans-item">
            <span class="trans-icon">${icon}</span>
            <div class="trans-info">
                <div class="trans-name">${book.title || 'Unknown Book'}</div>
                <div class="trans-sub">${user.name || tr.studentId} • ${status}</div>
            </div>
            <span class="trans-time">${tr.dueDate}</span>
        </div>`;
    }).join('');
}

function renderOverdueAlerts() {
    const issued = getIssued().filter(i => !i.returned);
    const books  = getBooks();
    const users  = getUsers();
    const el     = document.getElementById('overdue-alerts');
    if (!el) return;

    const overdue = issued.filter(i => calcFine(i.dueDate) > 0);
    if (!overdue.length) { el.innerHTML = '<p class="empty-state" style="color:var(--success)">✅ No overdue books!</p>'; return; }

    el.innerHTML = overdue.map(i => {
        const book = books.find(b => b.id === i.bookId) || {};
        const user = users.find(u => u.id === i.studentId) || {};
        const fine = calcFine(i.dueDate);
        return `<div class="overdue-item">
            <span>${user.name || i.studentId} – ${book.title || 'Book'}</span>
            <span>₹${fine}</span>
        </div>`;
    }).join('');
}

function renderAdminBooksTable() {
    let books = getBooks();
    const searchVal = (document.getElementById('bookSearchInput')?.value || '').toLowerCase();
    const catVal    = document.getElementById('categoryFilter')?.value || '';

    if (searchVal) books = books.filter(b =>
        b.title.toLowerCase().includes(searchVal) ||
        b.author.toLowerCase().includes(searchVal) ||
        b.category.toLowerCase().includes(searchVal)
    );
    if (catVal) books = books.filter(b => b.category === catVal);

    const tbody = document.getElementById('adminBooksTableBody');
    if (!tbody) return;

    if (!books.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No books found.</td></tr>';
        return;
    }
    tbody.innerHTML = books.map(b => {
        const avail = b.qty - b.issued;
        const badge = avail > 0
            ? `<span class="badge badge-green">${avail} Available</span>`
            : `<span class="badge badge-red">Out of Stock</span>`;
        return `<tr>
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td><span class="badge badge-blue">${b.category}</span></td>
            <td>Sem ${b.sem}</td>
            <td>${b.qty}</td>
            <td>${b.issued}</td>
            <td>${badge}</td>
        </tr>`;
    }).join('');
}

function setupAddBookForm() {
    const form = document.getElementById('addBookForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const books = getBooks();
        const id    = parseInt(document.getElementById('bookId').value);
        if (books.find(b => b.id === id)) { notify('Book ID already exists!', 'error'); return; }

        books.push({
            id,
            title:    document.getElementById('bookName').value.trim(),
            author:   document.getElementById('bookAuthor').value.trim(),
            category: document.getElementById('bookCategory').value,
            dept:     document.getElementById('bookDept').value.trim() || 'All',
            sem:      parseInt(document.getElementById('bookSemester').value) || 1,
            qty:      parseInt(document.getElementById('bookQty').value),
            issued:   0
        });
        saveBooks(books);
        form.reset();
        notify('Book added to library successfully!');
        renderAdminBooksTable();
        renderAdminStats();
    });
}

function setupIssueBookForm(session) {
    const form = document.getElementById('issueBookForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const stuId  = document.getElementById('issueStudentId').value.trim();
        const bookId = parseInt(document.getElementById('issueBookId').value);
        const due    = document.getElementById('issueDueDate').value;

        const books  = getBooks();
        const users  = getUsers();
        const issued = getIssued();

        const book = books.find(b => b.id === bookId);
        const user = users.find(u => u.id === stuId);

        if (!book) { notify('Book ID not found!', 'error'); return; }
        if (!user) { notify('Student ID not found!', 'error'); return; }
        if (book.qty - book.issued <= 0) { notify('No copies available!', 'error'); return; }

        const alreadyIssued = issued.find(i => i.studentId === stuId && i.bookId === bookId && !i.returned);
        if (alreadyIssued) { notify('Student already has this book!', 'error'); return; }

        const newIss = {
            id: 'ISS' + Date.now(),
            studentId:  stuId,
            bookId,
            issueDate:  new Date().toISOString().split('T')[0],
            dueDate:    due,
            returned:   false
        };
        issued.push(newIss);
        book.issued++;
        saveIssued(issued);
        saveBooks(books);
        form.reset();

        // Reset due date default
        const dd = document.getElementById('issueDueDate');
        if (dd) { const d = new Date(); d.setDate(d.getDate()+14); dd.value = d.toISOString().split('T')[0]; }

        notify(`Book "${book.title}" issued to ${user.name}!`);
        renderAdminStats();
        renderPendingTable();
    });
}

function renderPendingTable() {
    const issued = getIssued().filter(i => !i.returned);
    const books  = getBooks();
    const users  = getUsers();
    const tbody  = document.getElementById('pendingTableBody');
    const count  = document.getElementById('pending-count');
    if (!tbody) return;

    if (count) count.textContent = `${issued.length} pending`;

    if (!issued.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No pending returns 🎉</td></tr>';
        return;
    }
    tbody.innerHTML = issued.map(i => {
        const book = books.find(b => b.id === i.bookId) || {};
        const user = users.find(u => u.id === i.studentId) || {};
        const fine = calcFine(i.dueDate);
        const fineBadge = fine > 0
            ? `<span class="badge badge-red">₹${fine}</span>`
            : `<span class="badge badge-green">₹0</span>`;
        return `<tr>
            <td><strong>${user.name || '—'}</strong></td>
            <td>${i.studentId}</td>
            <td>${user.dept || '—'}</td>
            <td>${book.title || '—'}</td>
            <td>${i.dueDate}</td>
            <td>${fineBadge}</td>
            <td><button class="btn-success" onclick="adminReturnBook('${i.id}')">Return</button></td>
        </tr>`;
    }).join('');
}

function adminReturnBook(issId) {
    const issued = getIssued();
    const books  = getBooks();
    const rec    = issued.find(i => i.id === issId);
    if (!rec) return;
    rec.returned = true;
    const book = books.find(b => b.id === rec.bookId);
    if (book && book.issued > 0) book.issued--;
    saveIssued(issued);
    saveBooks(books);
    notify('Book returned successfully!');
    renderPendingTable();
    renderAdminStats();
    renderOverdueAlerts();
}

/* ═══════════════════════════════════════════════
   USER DASHBOARD
   ═══════════════════════════════════════════════ */
function initUserDashboard(session) {
    const users = getUsers();
    const user  = users.find(u => u.id === session.id);
    if (!user) { logout(); return; }

    // Topbar
    setText('topbar-name', user.name);
    setText('topbar-id',   'ID: ' + user.id);

    renderUserProfile(user);
    renderBooksGrid('', user);
    renderMyBooks(session);
    renderSuggestions('suggestGrid');

    // Category chips
    document.querySelectorAll('.cat-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderBooksGrid(chip.dataset.cat, user);
        });
    });

    // Search
    const searchIn = document.getElementById('bookSearchInput');
    if (searchIn) searchIn.addEventListener('input', () => {
        const activeCat = document.querySelector('.cat-chip.active')?.dataset.cat || '';
        renderBooksGrid(activeCat, user);
    });

    // Modal close
    document.getElementById('modalCloseBtn')?.addEventListener('click', closeModal);
    document.getElementById('bookDetailModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Request book
    document.getElementById('requestBookBtn')?.addEventListener('click', () => {
        const bookId = parseInt(window._modalBookId);
        requestBook(bookId, session);
    });
}

function onUserNav(viewId, session) {
    if (viewId === 'browse-view')  renderBooksGrid('', null);
    if (viewId === 'mybooks-view') renderMyBooks(session);
    if (viewId === 'suggest-view') renderSuggestions('suggestGrid');
}

function renderUserProfile(user) {
    const issued   = getIssued().filter(i => i.studentId === user.id && !i.returned);
    const fineTotal = issued.reduce((acc, i) => acc + calcFine(i.dueDate), 0);
    const dueSoon   = issued.filter(i => {
        const diff = Math.floor((new Date(i.dueDate) - new Date()) / 86400000);
        return diff >= 0 && diff <= 3;
    }).length;

    setText('profileName', user.name);
    setText('profileId',   'ID: ' + user.id);
    setText('profileDept', 'Dept: ' + user.dept);
    setText('profileSem',  'Sem: ' + user.sem);
    setText('pBooksIssued', issued.length);
    setText('pBooksDue',    dueSoon);
    setText('pFineTotal',   '₹' + fineTotal);
    const photo = document.getElementById('profilePhoto');
    if (photo) photo.textContent = user.photo || '🎓';
}

function renderBooksGrid(cat, user) {
    let books = getBooks();
    const searchVal = (document.getElementById('bookSearchInput')?.value || '').toLowerCase();
    if (cat)       books = books.filter(b => b.category === cat);
    if (searchVal) books = books.filter(b =>
        b.title.toLowerCase().includes(searchVal) ||
        b.author.toLowerCase().includes(searchVal)
    );

    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    if (!books.length) { grid.innerHTML = '<p class="empty-state">No books found.</p>'; return; }

    grid.innerHTML = books.map(b => {
        const avail = b.qty - b.issued;
        const availHtml = avail > 0
            ? `<span class="avail-yes">✅ ${avail} Available</span>`
            : `<span class="avail-no">❌ Out of Stock</span>`;
        return `
        <div class="book-card" onclick="openBookModal(${b.id})" title="Click to view details">
            <span class="book-emoji">${bookEmoji(b.category)}</span>
            <div class="book-title">${b.title}</div>
            <div class="book-author">by ${b.author}</div>
            <div class="book-meta">
                <span class="badge badge-blue">${b.category}</span>
                <span class="badge badge-amber">Sem ${b.sem}</span>
            </div>
            <div class="book-avail">${availHtml}</div>
        </div>`;
    }).join('');
}

function openBookModal(bookId) {
    const books = getBooks();
    const book  = books.find(b => b.id === bookId);
    if (!book) return;
    window._modalBookId = bookId;

    const avail   = book.qty - book.issued;
    const availHtml = avail > 0
        ? `<span class="avail-badge badge-green">✅ ${avail} cop${avail===1?'y':'ies'} available</span>`
        : `<span class="avail-badge badge-red">❌ Out of Stock</span>`;

    setText('modalTitle',  book.title);
    setText('modalAuthor', 'Author: ' + book.author);
    setText('modalCat',    'Category: ' + book.category);
    setText('modalDept',   'Dept: ' + book.dept);
    setText('modalSem',    'Sem: ' + book.sem);
    const icon = document.getElementById('modalIcon');
    if (icon) icon.textContent = bookEmoji(book.category);
    const avEl = document.getElementById('modalAvail');
    if (avEl) avEl.innerHTML = availHtml;

    const reqBtn = document.getElementById('requestBookBtn');
    if (reqBtn) reqBtn.disabled = avail <= 0;

    const modal = document.getElementById('bookDetailModal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('bookDetailModal');
    if (modal) modal.classList.add('hidden');
}

function requestBook(bookId, session) {
    const books  = getBooks();
    const issued = getIssued();
    const book   = books.find(b => b.id === bookId);
    if (!book) return;

    const avail = book.qty - book.issued;
    if (avail <= 0) { notify('No copies available!', 'error'); return; }

    const alreadyIssued = issued.find(i => i.studentId === session.id && i.bookId === bookId && !i.returned);
    if (alreadyIssued) { notify('You already have this book!', 'error'); return; }

    const due  = new Date();
    due.setDate(due.getDate() + 14);
    issued.push({
        id:        'ISS' + Date.now(),
        studentId: session.id,
        bookId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate:   due.toISOString().split('T')[0],
        returned:  false
    });
    book.issued++;
    saveIssued(issued);
    saveBooks(books);
    closeModal();
    notify(`"${book.title}" has been issued to you! Due: ${due.toDateString()}`);
    renderBooksGrid('', null);
    const users = getUsers();
    const user  = users.find(u => u.id === session.id);
    if (user) renderUserProfile(user);
}

function renderMyBooks(session) {
    const issued = getIssued().filter(i => i.studentId === session.id);
    const books  = getBooks();
    const tbody  = document.getElementById('myBooksTableBody');
    const count  = document.getElementById('mybooks-count');
    if (!tbody) return;

    const active = issued.filter(i => !i.returned);
    if (count) count.textContent = `${active.length} book${active.length===1?'':'s'}`;

    if (!issued.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">You have no issued books.</td></tr>';
        return;
    }
    tbody.innerHTML = issued.map(i => {
        const book  = books.find(b => b.id === i.bookId) || {};
        const fine  = i.returned ? 0 : calcFine(i.dueDate);
        const fineBadge = fine > 0
            ? `<span class="badge badge-red">₹${fine}</span>`
            : `<span class="badge badge-green">₹0</span>`;
        const statusBadge = i.returned
            ? `<span class="badge badge-green">Returned</span>`
            : (fine > 0 ? `<span class="badge badge-red">Overdue</span>` : `<span class="badge badge-amber">Active</span>`);
        const action = i.returned
            ? '—'
            : `<button class="btn-outline" onclick="returnBook('${i.id}','${session.id}')">Return</button>`;
        return `<tr>
            <td><strong>${book.title || '—'}</strong></td>
            <td>${book.author || '—'}</td>
            <td>${i.issueDate}</td>
            <td>${i.dueDate}</td>
            <td>${fineBadge}</td>
            <td>${statusBadge}</td>
            <td>${action}</td>
        </tr>`;
    }).join('');
}

function returnBook(issId, studentId) {
    const issued = getIssued();
    const books  = getBooks();
    const rec    = issued.find(i => i.id === issId);
    if (!rec || rec.returned) return;

    const fine = calcFine(rec.dueDate);
    if (fine > 0 && !confirm(`You have a fine of ₹${fine}. Proceed to return?`)) return;

    rec.returned = true;
    const book = books.find(b => b.id === rec.bookId);
    if (book && book.issued > 0) book.issued--;
    saveIssued(issued);
    saveBooks(books);

    const session = JSON.parse(sessionStorage.getItem('ll_session') || '{}');
    renderMyBooks(session);
    const users = getUsers();
    const user  = users.find(u => u.id === studentId);
    if (user) renderUserProfile(user);
    notify('Book returned successfully!' + (fine > 0 ? ` Fine paid: ₹${fine}` : ''));
}

/* ═══════════════════════════════════════════════
   SUGGESTIONS
   ═══════════════════════════════════════════════ */
function renderSuggestions(gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = SUGGESTIONS.map(s => `
        <div class="suggest-card">
            <span class="suggest-emoji">${s.emoji}</span>
            <div class="suggest-info">
                <div class="suggest-title">${s.title}</div>
                <div class="suggest-author">by ${s.author}</div>
                <div class="suggest-tags">
                    <span class="badge badge-blue">${s.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

/* ─── Utility ─── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

/* ═══════════════════════════════════════════════
   ROUTER / PAGE DETECTOR
   ═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('login.html')) {
        initLoginPage();
    } else if (path.includes('admin.html')) {
        initDashboard('admin');
    } else if (path.includes('user.html')) {
        initDashboard('user');
    }
    // index.html needs no JS init
});
