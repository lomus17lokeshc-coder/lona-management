# 📚 Lona Library – College Library Management System

A complete full-stack library management web application for **Lona Library** college.

---

## 🗂️ Project Structure

```
library_system/
├── htdocs/                     ← Web frontend (copy to XAMPP htdocs)
│   ├── index.html              ← Login selection (Admin / Student)
│   ├── login.html              ← Shared login form
│   ├── admin.html              ← Admin dashboard
│   ├── user.html               ← Student dashboard
│   ├── css/style.css           ← Full stylesheet
│   └── js/app.js               ← All frontend logic + localStorage
│
├── cgi-bin/                    ← CGI backend (copy .exe to Apache cgi-bin)
│   ├── backend_source/
│   │   ├── common.h            ← Shared structs & helpers
│   │   ├── login.c             ← Login validation CGI
│   │   ├── books.c             ← Add / list books CGI
│   │   ├── view_books.c        ← Read-only book list CGI
│   │   ├── issue_book.c        ← Issue book CGI
│   │   └── return_book.c       ← Return book + fine CGI
│   └── data/
│       ├── books.txt           ← Book records
│       ├── users.txt           ← Student records
│       ├── admins.txt          ← Admin credentials
│       └── issued.txt          ← Issue/return records
│
└── build.bat                   ← Compile all C files with GCC
```

---

## 🚀 Quick Start (Standalone – No Server Needed)

Just open `htdocs/index.html` directly in a browser.  
The app uses **localStorage** as a fallback when no CGI server is running.

**Test Credentials:**

| Role    | ID      | Password   |
|---------|---------|------------|
| Admin   | ADM001  | admin123   |
| Student | STU001  | pass123    |
| Student | STU002  | pass123    |
| Student | STU003  | pass123    |

---

## 🖥️ Full XAMPP/Apache CGI Setup

### Step 1 – Compile C Programs
```bat
cd "D:\PROJECT 111\library_system"
build.bat
```
Requires GCC (MinGW). Install from https://www.mingw-w64.org/

### Step 2 – Deploy to XAMPP
1. Copy `cgi-bin\*.exe` → `C:\xampp\cgi-bin\`
2. Copy `cgi-bin\data\` → `C:\xampp\cgi-bin\data\`
3. Copy `htdocs\*` → `C:\xampp\htdocs\lona_library\`

### Step 3 – Enable CGI in Apache
Add to `httpd.conf`:
```apache
<Directory "C:/xampp/cgi-bin">
    Options ExecCGI
    AddHandler cgi-script .exe
</Directory>
```

### Step 4 – Open
```
http://localhost/lona_library/
```

---

## ✨ Features

### Admin Dashboard
- 📊 Stats: Total Students, Issued, Returned, Pending
- 📖 View & search all books (filter by category)
- ➕ Add new books (ID, title, author, category, dept, semester, qty)
- 📤 Issue book to student (with due date)
- ⏳ Pending returns list with fine calculation
- 💡 Book suggestions section

### Student Dashboard
- 🏠 Profile card (name, dept, semester, stats)
- 📖 Browse books grid with category chips and search
- 🔍 Click book card → detail modal → Request Book
- 📋 My Books table (issue date, due date, fine, return button)
- 💡 Suggested reading section

### Fine System
- **₹1 per day** after due date
- Shown in Pending Returns and My Books table
- Confirmation prompt on student return if fine > ₹0

---

## 🛠️ Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | HTML5, CSS3, Vanilla JS        |
| Backend  | C language (CGI via Apache)    |
| Storage  | Plain text files (.txt)        |
| Fallback | Browser localStorage           |
| Font     | Google Fonts – Inter           |

---

## 📝 Data File Formats

**books.txt** — `id|title|author|category|dept|sem|qty|issued`  
**users.txt** — `id|name|dept|sem|password`  
**admins.txt** — `id|password`  
**issued.txt** — `issue_id|student_id|book_id|issue_date|due_date|returned`

---

© 2024 Lona Library – All Rights Reserved
