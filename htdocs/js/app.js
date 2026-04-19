/*  ================================================
    LONA LIBRARY – app.js
    Mock-backend version: reads/writes to
    mock_server.js (Node) OR falls back to
    localStorage when server is unavailable.
    ================================================ */

const API = 'http://localhost:3000/cgi-bin';

/* ─── Seed Data ─── */
const SEED_BOOKS = [
    { id:1,  title:"Database System Concepts",       author:"Silberschatz & Korth", category:"DBMS",        dept:"CS",  sem:4, qty:5, issued:2,
      description:"Comprehensive guide covering relational model, SQL, database design, indexing, query processing, transaction management, and concurrency control. Ideal for students learning the fundamentals of database systems." },
    { id:2,  title:"Operating System Concepts",      author:"Abraham Silberschatz", category:"OS",          dept:"CS",  sem:5, qty:4, issued:4,
      description:"Covers process management, memory management, storage management, protection & security. Includes case studies on Linux and Windows. A must-read for understanding how modern operating systems work." },
    { id:3,  title:"Data Structures using C",        author:"Reema Thareja",        category:"DS",          dept:"CS",  sem:3, qty:6, issued:1,
      description:"Detailed coverage of arrays, linked lists, stacks, queues, trees, graphs, sorting and searching algorithms. Includes C implementations and practice problems for each data structure." },
    { id:4,  title:"Higher Engineering Mathematics", author:"B.S. Grewal",          category:"Maths",       dept:"All", sem:2, qty:8, issued:3,
      description:"Covers differential calculus, integral calculus, linear algebra, differential equations, complex analysis, probability, and statistics. One of the most recommended books for engineering mathematics." },
    { id:5,  title:"Computer Networks",              author:"Andrew Tanenbaum",     category:"Networks",    dept:"CS",  sem:6, qty:3, issued:1,
      description:"Covers network architecture, TCP/IP, wireless networks, network security, and application layer protocols. Provides both theoretical concepts and practical insights into internet technologies." },
    { id:6,  title:"Introduction to Algorithms",     author:"Cormen et al.",        category:"DS",          dept:"CS",  sem:4, qty:4, issued:2,
      description:"Known as CLRS, this book covers algorithm design, analysis, sorting, graph algorithms, dynamic programming, greedy algorithms, and NP-completeness. The gold standard for algorithm study." },
    { id:7,  title:"Let Us C",                       author:"Yashavant Kanetkar",   category:"Programming", dept:"CS",  sem:1, qty:10,issued:4,
      description:"A beginner-friendly introduction to C programming. Covers data types, control structures, functions, pointers, file handling, and dynamic memory allocation with hands-on exercises." },
    { id:8,  title:"Discrete Mathematics",           author:"Kenneth H. Rosen",     category:"Maths",       dept:"All", sem:3, qty:5, issued:0,
      description:"Covers logic, set theory, combinatorics, graph theory, number theory, and algebraic structures. Essential for computer science students to build a strong mathematical foundation." },
    { id:9,  title:"The Linux Command Line",         author:"William Shotts",       category:"OS",          dept:"CS",  sem:5, qty:2, issued:1,
      description:"Practical guide to mastering the Linux shell. Covers navigation, file management, text processing, scripting, permissions, and package management with real-world examples." },
    { id:10, title:"DBMS by Navathe",                author:"Elmasri & Navathe",    category:"DBMS",        dept:"CS",  sem:4, qty:3, issued:3,
      description:"Comprehensive coverage of database modeling, relational algebra, SQL, normalization, transaction processing, and distributed databases. An excellent companion to any DBMS course." },
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

const SEED_RETURN_REQUESTS = [];

/* ─── NEW: Seed Issue Requests ─── */
const SEED_ISSUE_REQUESTS = [];

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
function getBooks()          { return JSON.parse(localStorage.getItem('ll_books')           || 'null') || SEED_BOOKS.map(b => ({...b})); }
function getUsers()          { return JSON.parse(localStorage.getItem('ll_users')           || 'null') || SEED_USERS.map(u => ({...u})); }
function getIssued()         { return JSON.parse(localStorage.getItem('ll_issued')          || 'null') || SEED_ISSUED.map(i => ({...i})); }
function getReturnRequests() { return JSON.parse(localStorage.getItem('ll_return_requests') || 'null') || SEED_RETURN_REQUESTS.map(r => ({...r})); }
function getIssueRequests()  { return JSON.parse(localStorage.getItem('ll_issue_requests')  || 'null') || SEED_ISSUE_REQUESTS.map(r => ({...r})); }

function saveBooks(d)          { localStorage.setItem('ll_books',           JSON.stringify(d)); }
function saveUsers(d)          { localStorage.setItem('ll_users',           JSON.stringify(d)); }
function saveIssued(d)         { localStorage.setItem('ll_issued',          JSON.stringify(d)); }
function saveReturnRequests(d) { localStorage.setItem('ll_return_requests', JSON.stringify(d)); }
function saveIssueRequests(d)  { localStorage.setItem('ll_issue_requests',  JSON.stringify(d)); }

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
    renderReturnRequestsTable();
    renderIssueRequestsTable();   /* ← NEW */

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
    if (viewId === 'dash-view')             { renderAdminStats(); renderRecentTransactions(); renderOverdueAlerts(); }
    if (viewId === 'books-view')            renderAdminBooksTable();
    if (viewId === 'pending-view')          renderPendingTable();
    if (viewId === 'return-requests-view')  renderReturnRequestsTable();
    if (viewId === 'issue-requests-view')   renderIssueRequestsTable();   /* ← NEW */
    if (viewId === 'suggest-view')          renderSuggestions('suggestGrid');
}

function renderAdminStats() {
    const users    = getUsers();
    const issued   = getIssued();
    const retReqs  = getReturnRequests();
    const issReqs  = getIssueRequests();
    const total    = issued.length;
    const ret      = issued.filter(i => i.returned).length;
    const pend     = issued.filter(i => !i.returned).length;
    const pendRetReqs = retReqs.filter(r => r.status === 'Pending').length;
    const pendIssReqs = issReqs.filter(r => r.status === 'Pending').length;

    setText('stat-students',    users.length);
    setText('stat-issued',      total);
    setText('stat-returned',    ret);
    setText('stat-pending',     pend);
    setText('stat-return-reqs', pendRetReqs);
    setText('stat-issue-reqs',  pendIssReqs);   /* ← NEW */
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

/* ─── Admin Books Table (with description) ─── */
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
        tbody.innerHTML = '<tr><td colspan="9" class="empty-state">No books found.</td></tr>';
        return;
    }
    tbody.innerHTML = books.map(b => {
        const avail = b.qty - b.issued;
        const badge = avail > 0
            ? `<span class="badge badge-green">${avail} Available</span>`
            : `<span class="badge badge-red">Out of Stock</span>`;
        const desc = b.description
            ? `<div class="desc-preview-cell" title="${escapeHtml(b.description)}">${truncate(b.description, 60)}</div>`
            : `<span class="text-muted">—</span>`;
        return `<tr>
            <td>#${b.id}</td>
            <td><strong>${b.title}</strong></td>
            <td>${b.author}</td>
            <td><span class="badge badge-blue">${b.category}</span></td>
            <td>Sem ${b.sem}</td>
            <td>${b.qty}</td>
            <td>${b.issued}</td>
            <td>${badge}</td>
            <td>${desc}</td>
        </tr>`;
    }).join('');
}

/* ─── Add Book Form (with description) ─── */
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
            title:       document.getElementById('bookName').value.trim(),
            author:      document.getElementById('bookAuthor').value.trim(),
            category:    document.getElementById('bookCategory').value,
            dept:        document.getElementById('bookDept').value.trim() || 'All',
            sem:         parseInt(document.getElementById('bookSemester').value) || 1,
            qty:         parseInt(document.getElementById('bookQty').value),
            issued:      0,
            description: document.getElementById('bookDescription').value.trim() || ''
        });
        saveBooks(books);
        form.reset();
        notify('Book added to library successfully!');
        renderAdminBooksTable();
        renderAdminStats();
    });
}

/* ─── Admin Direct Issue Book Form (kept for admin convenience) ─── */
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
   RETURN REQUESTS TABLE (Admin Side)
   ═══════════════════════════════════════════════ */
function renderReturnRequestsTable() {
    const retReqs = getReturnRequests();
    const books   = getBooks();
    const users   = getUsers();
    const tbody   = document.getElementById('returnReqTableBody');
    const count   = document.getElementById('return-req-count');
    if (!tbody) return;

    const pending  = retReqs.filter(r => r.status === 'Pending');
    const resolved = retReqs.filter(r => r.status !== 'Pending');
    const all      = [...pending, ...resolved];

    if (count) count.textContent = `${pending.length} pending`;

    if (!all.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No return requests yet 📭</td></tr>';
        return;
    }
    tbody.innerHTML = all.map(r => {
        const book = books.find(b => b.id === r.bookId) || {};
        const user = users.find(u => u.id === r.studentId) || {};
        let statusBadge = '';
        let actions = '';
        if (r.status === 'Pending') {
            statusBadge = '<span class="badge badge-amber">⏳ Pending</span>';
            actions = `
                <button class="btn-approve" onclick="approveReturnReq('${r.id}')">✅ Approve</button>
                <button class="btn-reject" onclick="rejectReturnReq('${r.id}')">❌ Reject</button>`;
        } else if (r.status === 'Approved') {
            statusBadge = '<span class="badge badge-green">✅ Approved</span>';
            actions = '<span class="text-muted">—</span>';
        } else {
            statusBadge = '<span class="badge badge-red">❌ Rejected</span>';
            actions = '<span class="text-muted">—</span>';
        }
        return `<tr>
            <td><strong>${user.name || r.studentName || '—'}</strong></td>
            <td>${r.studentId}</td>
            <td>${book.title || '—'}</td>
            <td>#${r.bookId}</td>
            <td>${statusBadge}</td>
            <td>${r.requestDate || '—'}</td>
            <td class="action-btns">${actions}</td>
        </tr>`;
    }).join('');
}

function approveReturnReq(reqId) {
    const retReqs = getReturnRequests();
    const req = retReqs.find(r => r.id === reqId);
    if (!req || req.status !== 'Pending') return;

    req.status = 'Approved';
    saveReturnRequests(retReqs);

    const issued = getIssued();
    const books  = getBooks();
    const rec    = issued.find(i => i.id === req.issueId);
    if (rec && !rec.returned) {
        rec.returned = true;
        const book = books.find(b => b.id === rec.bookId);
        if (book && book.issued > 0) book.issued--;
        saveIssued(issued);
        saveBooks(books);
    }

    notify('Return request approved! Book marked as returned.');
    renderReturnRequestsTable();
    renderPendingTable();
    renderAdminStats();
    renderOverdueAlerts();
}

function rejectReturnReq(reqId) {
    const retReqs = getReturnRequests();
    const req = retReqs.find(r => r.id === reqId);
    if (!req || req.status !== 'Pending') return;

    req.status = 'Rejected';
    saveReturnRequests(retReqs);

    notify('Return request rejected. No changes made to book status.', 'error');
    renderReturnRequestsTable();
    renderAdminStats();
}

/* ═══════════════════════════════════════════════
   NEW: ISSUE REQUESTS TABLE (Admin Side)
   ═══════════════════════════════════════════════ */
function renderIssueRequestsTable() {
    const issReqs = getIssueRequests();
    const books   = getBooks();
    const users   = getUsers();
    const tbody   = document.getElementById('issueReqTableBody');
    const count   = document.getElementById('issue-req-count');
    if (!tbody) return;

    const pending  = issReqs.filter(r => r.status === 'Pending');
    const resolved = issReqs.filter(r => r.status !== 'Pending');
    const all      = [...pending, ...resolved];

    if (count) count.textContent = `${pending.length} pending`;

    if (!all.length) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No issue requests yet 📭</td></tr>';
        return;
    }
    tbody.innerHTML = all.map(r => {
        const book  = books.find(b => b.id === r.bookId) || {};
        const user  = users.find(u => u.id === r.studentId) || {};
        const avail = book.qty ? (book.qty - (book.issued || 0)) : 0;
        let statusBadge = '';
        let actions = '';
        if (r.status === 'Pending') {
            statusBadge = '<span class="badge badge-amber">⏳ Pending</span>';
            if (avail > 0) {
                actions = `
                    <button class="btn-approve" onclick="approveIssueReq('${r.id}')">✅ Approve</button>
                    <button class="btn-reject" onclick="rejectIssueReq('${r.id}')">❌ Reject</button>`;
            } else {
                actions = `
                    <span class="badge badge-red" style="margin-right:6px">No Stock</span>
                    <button class="btn-reject" onclick="rejectIssueReq('${r.id}')">❌ Reject</button>`;
            }
        } else if (r.status === 'Approved') {
            statusBadge = '<span class="badge badge-green">✅ Approved</span>';
            actions = '<span class="text-muted">—</span>';
        } else {
            statusBadge = '<span class="badge badge-red">❌ Rejected</span>';
            actions = '<span class="text-muted">—</span>';
        }
        return `<tr>
            <td><strong>${user.name || r.studentName || '—'}</strong></td>
            <td>${r.studentId}</td>
            <td>${book.title || '—'}</td>
            <td>#${r.bookId}</td>
            <td>${statusBadge}</td>
            <td>${r.requestDate || '—'}</td>
            <td class="action-btns">${actions}</td>
        </tr>`;
    }).join('');
}

/* ─── Approve Issue Request ─── */
function approveIssueReq(reqId) {
    const issReqs = getIssueRequests();
    const req = issReqs.find(r => r.id === reqId);
    if (!req || req.status !== 'Pending') return;

    const books  = getBooks();
    const issued = getIssued();
    const users  = getUsers();
    const book   = books.find(b => b.id === req.bookId);
    const user   = users.find(u => u.id === req.studentId);

    if (!book) { notify('Book not found!', 'error'); return; }
    if (book.qty - book.issued <= 0) { notify('No copies available to approve this request!', 'error'); return; }

    // Check if student already has this book
    const alreadyHas = issued.find(i => i.studentId === req.studentId && i.bookId === req.bookId && !i.returned);
    if (alreadyHas) { notify('Student already has this book issued!', 'error'); return; }

    // Create the issued record
    const due = new Date();
    due.setDate(due.getDate() + 14);
    const newIss = {
        id:        'ISS' + Date.now(),
        studentId: req.studentId,
        bookId:    req.bookId,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate:   due.toISOString().split('T')[0],
        returned:  false
    };
    issued.push(newIss);
    book.issued++;

    req.status = 'Approved';
    req.issueId = newIss.id;

    saveIssueRequests(issReqs);
    saveIssued(issued);
    saveBooks(books);

    notify(`Issue request approved! "${book.title}" issued to ${user?.name || req.studentId}.`);
    renderIssueRequestsTable();
    renderPendingTable();
    renderAdminStats();
    renderAdminBooksTable();
}

/* ─── Reject Issue Request ─── */
function rejectIssueReq(reqId) {
    const issReqs = getIssueRequests();
    const req = issReqs.find(r => r.id === reqId);
    if (!req || req.status !== 'Pending') return;

    req.status = 'Rejected';
    saveIssueRequests(issReqs);

    notify('Issue request rejected. No changes made.', 'error');
    renderIssueRequestsTable();
    renderAdminStats();
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
    renderMyIssueRequests(session);   /* ← NEW */
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

    // MODIFIED: Request book now submits an issue request
    document.getElementById('requestBookBtn')?.addEventListener('click', () => {
        const bookId = parseInt(window._modalBookId);
        submitIssueRequest(bookId, session);   /* ← CHANGED from requestBook */
    });
}

function onUserNav(viewId, session) {
    if (viewId === 'browse-view')       renderBooksGrid('', null);
    if (viewId === 'mybooks-view')      renderMyBooks(session);
    if (viewId === 'my-requests-view')  renderMyIssueRequests(session);   /* ← NEW */
    if (viewId === 'suggest-view')      renderSuggestions('suggestGrid');
}

function renderUserProfile(user) {
    const issued    = getIssued().filter(i => i.studentId === user.id && !i.returned);
    const fineTotal = issued.reduce((acc, i) => acc + calcFine(i.dueDate), 0);
    const dueSoon   = issued.filter(i => {
        const diff = Math.floor((new Date(i.dueDate) - new Date()) / 86400000);
        return diff >= 0 && diff <= 3;
    }).length;
    const retReqs     = getReturnRequests().filter(r => r.studentId === user.id && r.status === 'Pending').length;
    const issReqs     = getIssueRequests().filter(r => r.studentId === user.id && r.status === 'Pending').length;

    setText('profileName', user.name);
    setText('profileId',   'ID: ' + user.id);
    setText('profileDept', 'Dept: ' + user.dept);
    setText('profileSem',  'Sem: ' + user.sem);
    setText('pBooksIssued', issued.length);
    setText('pBooksDue',    dueSoon);
    setText('pFineTotal',   '₹' + fineTotal);
    setText('pReturnReqs',  retReqs);
    setText('pIssueReqs',   issReqs);   /* ← NEW */
    const photo = document.getElementById('profilePhoto');
    if (photo) photo.textContent = user.photo || '🎓';
}

/* ─── Books Grid (with description preview) ─── */
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
            : `<span class="avail-no">❌ Not Available</span>`;
        const descHtml = b.description
            ? `<div class="book-desc-preview">${truncate(b.description, 80)}</div>`
            : '';
        return `
        <div class="book-card" onclick="openBookModal(${b.id})" title="Click to view details">
            <span class="book-emoji">${bookEmoji(b.category)}</span>
            <div class="book-title">${b.title}</div>
            <div class="book-author">by ${b.author}</div>
            ${descHtml}
            <div class="book-meta">
                <span class="badge badge-blue">${b.category}</span>
                <span class="badge badge-amber">Sem ${b.sem}</span>
            </div>
            <div class="book-avail">${availHtml}</div>
        </div>`;
    }).join('');
}

/* ─── MODIFIED: Book Modal – button now says "Request Issue" and checks existing requests ─── */
function openBookModal(bookId) {
    const books = getBooks();
    const book  = books.find(b => b.id === bookId);
    if (!book) return;
    window._modalBookId = bookId;

    const session  = JSON.parse(sessionStorage.getItem('ll_session') || '{}');
    const avail    = book.qty - book.issued;
    const issued   = getIssued();
    const issReqs  = getIssueRequests();

    const availHtml = avail > 0
        ? `<span class="avail-badge badge-green">✅ ${avail} cop${avail===1?'y':'ies'} available</span>`
        : `<span class="avail-badge badge-red">❌ Not Available</span>`;

    setText('modalTitle',  book.title);
    setText('modalAuthor', 'Author: ' + book.author);
    setText('modalCat',    'Category: ' + book.category);
    setText('modalDept',   'Dept: ' + book.dept);
    setText('modalSem',    'Sem: ' + book.sem);

    const descEl = document.getElementById('modalDescription');
    if (descEl) {
        descEl.textContent = book.description || 'No description available for this book.';
    }

    const icon = document.getElementById('modalIcon');
    if (icon) icon.textContent = bookEmoji(book.category);
    const avEl = document.getElementById('modalAvail');
    if (avEl) avEl.innerHTML = availHtml;

    /* ─── MODIFIED: Determine button state ─── */
    const reqBtn = document.getElementById('requestBookBtn');
    if (reqBtn) {
        // Check if student already has this book issued
        const alreadyHas = issued.find(i => i.studentId === session.id && i.bookId === bookId && !i.returned);
        // Check if there's already a pending issue request
        const pendingReq = issReqs.find(r => r.studentId === session.id && r.bookId === bookId && r.status === 'Pending');

        if (alreadyHas) {
            reqBtn.disabled = true;
            reqBtn.textContent = '📚 Already Issued to You';
            reqBtn.className = 'btn-primary btn-full btn-disabled-state';
        } else if (pendingReq) {
            reqBtn.disabled = true;
            reqBtn.textContent = '⏳ Request Pending Approval';
            reqBtn.className = 'btn-primary btn-full btn-pending-state';
        } else if (avail <= 0) {
            reqBtn.disabled = true;
            reqBtn.textContent = '❌ Not Available';
            reqBtn.className = 'btn-primary btn-full btn-disabled-state';
        } else {
            reqBtn.disabled = false;
            reqBtn.textContent = '📋 Request This Book';
            reqBtn.className = 'btn-primary btn-full';
        }
    }

    const modal = document.getElementById('bookDetailModal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('bookDetailModal');
    if (modal) modal.classList.add('hidden');
}

/* ═══════════════════════════════════════════════
   NEW: Submit Issue Request (Student Side)
   Replaces direct requestBook()
   ═══════════════════════════════════════════════ */
function submitIssueRequest(bookId, session) {
    const books   = getBooks();
    const issued  = getIssued();
    const issReqs = getIssueRequests();
    const users   = getUsers();
    const book    = books.find(b => b.id === bookId);
    const user    = users.find(u => u.id === session.id);
    if (!book) return;

    const avail = book.qty - book.issued;
    if (avail <= 0) { notify('This book is not available!', 'error'); return; }

    // Check already issued
    const alreadyHas = issued.find(i => i.studentId === session.id && i.bookId === bookId && !i.returned);
    if (alreadyHas) { notify('You already have this book!', 'error'); return; }

    // Check for already pending request
    const alreadyPending = issReqs.find(r => r.studentId === session.id && r.bookId === bookId && r.status === 'Pending');
    if (alreadyPending) { notify('You already have a pending request for this book!', 'error'); return; }

    // Remove any old rejected request for this book from this student
    const oldRejectedIdx = issReqs.findIndex(r => r.studentId === session.id && r.bookId === bookId && r.status === 'Rejected');
    if (oldRejectedIdx !== -1) issReqs.splice(oldRejectedIdx, 1);

    issReqs.push({
        id:          'IREQ' + Date.now(),
        bookId:      bookId,
        studentId:   session.id,
        studentName: user?.name || session.id,
        status:      'Pending',
        requestDate: new Date().toISOString().split('T')[0]
    });
    saveIssueRequests(issReqs);

    closeModal();
    notify(`Issue request submitted for "${book.title}". Awaiting admin approval.`);
    renderBooksGrid('', user);
    renderMyIssueRequests(session);
    if (user) renderUserProfile(user);
}

/* ─── My Books – Return button submits Return Request ─── */
function renderMyBooks(session) {
    const issued  = getIssued().filter(i => i.studentId === session.id);
    const books   = getBooks();
    const retReqs = getReturnRequests();
    const tbody   = document.getElementById('myBooksTableBody');
    const count   = document.getElementById('mybooks-count');
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

        const existingReq = retReqs.find(r => r.issueId === i.id);
        let statusBadge = '';
        let action = '';

        if (i.returned) {
            statusBadge = `<span class="badge badge-green">Returned</span>`;
            action = '—';
        } else if (existingReq && existingReq.status === 'Pending') {
            statusBadge = `<span class="badge badge-amber">🔄 Return Pending</span>`;
            action = `<span class="badge badge-amber">Awaiting Approval</span>`;
        } else if (existingReq && existingReq.status === 'Rejected') {
            statusBadge = fine > 0
                ? `<span class="badge badge-red">Overdue</span>`
                : `<span class="badge badge-amber">Active</span>`;
            action = `<button class="btn-outline" onclick="submitReturnRequest('${i.id}','${session.id}')">Request Return Again</button>`;
        } else {
            statusBadge = fine > 0
                ? `<span class="badge badge-red">Overdue</span>`
                : `<span class="badge badge-amber">Active</span>`;
            action = `<button class="btn-outline" onclick="submitReturnRequest('${i.id}','${session.id}')">Request Return</button>`;
        }

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

/* ═══════════════════════════════════════════════
   NEW: My Issue Requests (Student Side)
   Shows all issue requests and their statuses
   ═══════════════════════════════════════════════ */
function renderMyIssueRequests(session) {
    const issReqs = getIssueRequests().filter(r => r.studentId === session.id);
    const books   = getBooks();
    const tbody   = document.getElementById('myIssueReqTableBody');
    const count   = document.getElementById('my-issue-req-count');
    if (!tbody) return;

    const pending = issReqs.filter(r => r.status === 'Pending');
    if (count) count.textContent = `${pending.length} pending`;

    if (!issReqs.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">You have no issue requests.</td></tr>';
        return;
    }

    // Sort: pending first, then resolved
    const sorted = [...issReqs.filter(r => r.status === 'Pending'), ...issReqs.filter(r => r.status !== 'Pending')];

    tbody.innerHTML = sorted.map(r => {
        const book = books.find(b => b.id === r.bookId) || {};
        let statusBadge = '';
        if (r.status === 'Pending') {
            statusBadge = '<span class="badge badge-amber">⏳ Pending</span>';
        } else if (r.status === 'Approved') {
            statusBadge = '<span class="badge badge-green">✅ Approved</span>';
        } else {
            statusBadge = '<span class="badge badge-red">❌ Rejected</span>';
        }
        return `<tr>
            <td><strong>${book.title || '—'}</strong></td>
            <td>${book.author || '—'}</td>
            <td>#${r.bookId}</td>
            <td>${r.requestDate || '—'}</td>
            <td>${statusBadge}</td>
        </tr>`;
    }).join('');
}

/* ─── Submit Return Request (Student Side) ─── */
function submitReturnRequest(issueId, studentId) {
    const issued  = getIssued();
    const books   = getBooks();
    const users   = getUsers();
    const retReqs = getReturnRequests();

    const rec  = issued.find(i => i.id === issueId);
    if (!rec || rec.returned) return;

    const book = books.find(b => b.id === rec.bookId) || {};
    const user = users.find(u => u.id === studentId) || {};

    const existingIdx = retReqs.findIndex(r => r.issueId === issueId && r.status === 'Rejected');
    if (existingIdx !== -1) retReqs.splice(existingIdx, 1);

    const alreadyPending = retReqs.find(r => r.issueId === issueId && r.status === 'Pending');
    if (alreadyPending) {
        notify('You already have a pending return request for this book!', 'error');
        return;
    }

    const fine = calcFine(rec.dueDate);

    retReqs.push({
        id:          'RET' + Date.now(),
        issueId:     issueId,
        bookId:      rec.bookId,
        studentId:   studentId,
        studentName: user.name || studentId,
        status:      'Pending',
        requestDate: new Date().toISOString().split('T')[0],
        fine:        fine
    });
    saveReturnRequests(retReqs);

    const session = JSON.parse(sessionStorage.getItem('ll_session') || '{}');
    renderMyBooks(session);
    if (user) renderUserProfile(user);
    notify(`Return request submitted for "${book.title}". Awaiting admin approval.`);
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

/* ─── Utilities ─── */
function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function truncate(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.substring(0, maxLen) + '…' : str;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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
