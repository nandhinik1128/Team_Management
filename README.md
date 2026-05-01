<div align="center">

# 🚀 InnovateX

### Unified Student Collaboration & Performance Platform

[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)](.)
[![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-blue?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](.)
[![Team](https://img.shields.io/badge/Team-4%20Members-orange?style=for-the-badge)](.)

> *A full-stack web platform that simulates real-world team dynamics — empowering students with role-based workflows, task ownership, and performance visibility.*

---

</div>

## 📌 Project Overview

**InnovateX** is a production-inspired, full-stack web application built to bridge the gap between classroom collaboration and real-world team environments. It provides structured, role-based team management where every member has defined responsibilities, measurable performance, and a stake in collective success.

Designed for student teams, InnovateX goes beyond basic project tools — it introduces a **points-based performance system (AP/RP)**, live leaderboards, task ownership, and a multi-channel communication layer that mirrors how software teams actually operate.

| Attribute | Detail |
|-----------|--------|
| 🏗️ Type | Full-Stack Web Application |
| 🎯 Purpose | Student Team Collaboration & Performance Tracking |
| 👥 Team Size | 4 Members |
| 🔐 Auth Model | Role-Based Access Control (RBAC) |
| 📊 Points System | AP (Achievement Points) + RP (Reputation Points) |
| ⚙️ API Style | RESTful |
| 🔮 Future Integration | Real-time (Socket.io), Google Workspace |

---

## ✅ Features

### 🟢 Completed

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | Secure login/register with JWT, predefined role assignment |
| 🛡️ Role-Based Access Control | Granular permissions for 5 distinct roles |
| ✅ Task Management | Full CRUD — create, assign, update, delete tasks |
| 🏆 Leaderboard | Dynamic ranking derived from AP/RP points |
| 📊 Points Tracking | AP (task completion) and RP (reputation/behavior) scoring |
| 👤 User Profiles | Personal stats, task history, role permissions |
| 🖥️ Dashboard UI | Overview of team activity, tasks, and standings |
| 🎨 Sidebar Navigation | Professional, role-aware sidebar UI layout |
| 💬 Chat Backend | Full API + database layer for group messaging |

### 🟡 In Progress

| Feature | Status |
|---------|--------|
| 💬 Chat Frontend | Backend ready; UI under development |
| 📁 Projects Module | Schema defined; frontend pending |
| 📅 Meetings Module | Planned structure in place |

### 🔵 Planned

- 🔴 Real-time updates via **Socket.io**
- 🔔 Notifications system
- 📰 Activity feed / audit log
- 📂 File management & uploads
- 🧠 Skill tracking per member
- 🗓️ Attendance tracking
- 📈 Analytics dashboard
- 🔍 Search functionality (global)
- 📊 Polls & voting system
- 🌙 Dark / Light mode toggle
- 🔗 External integrations (Google Meet, Drive, Calendar)
- 📄 Report generation (PDF / Excel export)

---

## 🔄 System Flow

```
User Login / Register
        │
        ▼
  JWT Token Issued
        │
        ▼
  Role Assigned (Captain / Vice-Captain / Manager / Strategist / Member)
        │
        ├──▶ Dashboard        → Overview of tasks, standings, activity
        ├──▶ Task Management  → Create / assign / update tasks → AP awarded on completion
        ├──▶ Leaderboard      → Live rankings from AP + RP totals
        ├──▶ Profile          → Personal stats, permissions, task history
        ├──▶ Chat (WIP)       → Group messaging (backend ready)
        ├──▶ Projects (WIP)   → Project-level tracking
        └──▶ Meetings (WIP)   → Scheduling & notes
```

---

## 🛡️ Role-Based Capabilities

| Capability | Captain | Vice-Captain | Manager | Strategist | Member |
|------------|:-------:|:------------:|:-------:|:----------:|:------:|
| Create Tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Assign Tasks | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Task Status | ✅ | ✅ | ✅ | ✅ | ✅ (own) |
| Delete Tasks | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Leaderboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage AP/RP Points | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Profiles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Chat Groups | ✅ | ✅ | ✅ | ❌ | ❌ |
| Admin Controls | ✅ | ⚠️ Limited | ❌ | ❌ | ❌ |

> ⚠️ Permissions are enforced via JWT middleware on every protected route.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| ⚛️ React.js | Component-based UI framework |
| 🔀 React Router | Client-side routing & protected routes |
| 📡 Axios | HTTP client for API communication |
| 🎨 CSS / Custom Components | Sidebar layout, responsive design |

### Backend
| Technology | Purpose |
|------------|---------|
| 🟩 Node.js | JavaScript runtime |
| ⚡ Express.js | REST API framework |
| 🔐 JWT | Stateless authentication tokens |
| 🔒 bcrypt | Password hashing |

### Database
| Technology | Purpose |
|------------|---------|
| 🐬 MySQL | Relational data storage |
| 🔗 mysql2 | Node.js MySQL driver |

### Upcoming
| Technology | Purpose |
|------------|---------|
| 🔌 Socket.io | Real-time bidirectional events |
| 📄 PDFKit / ExcelJS | Report generation |

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (React.js)                 │
│   Pages: Login, Dashboard, Tasks, Leaderboard,      │
│          Profile, Chat*, Projects*, Meetings*        │
│   Context: AuthContext (JWT + User State)            │
│   API Layer: Axios (api/axios.js)                   │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────┐
│                  SERVER (Express.js)                 │
│   Routes: /auth /tasks /leaderboard /users /chat    │
│   Middleware: auth.js (JWT Verification)            │
│   Controllers: Business Logic per Domain            │
└──────────────────────┬──────────────────────────────┘
                       │ mysql2
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE (MySQL)                    │
│   Tables: users, tasks, leaderboard (view),         │
│           chat_groups, group_members, chat_messages  │
└─────────────────────────────────────────────────────┘
```

> \* = Under active development

---

## 📁 Project Structure

```
innovatex/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js        # Register, login, token logic
│   │   ├── taskController.js        # Task CRUD + status updates
│   │   ├── leaderboardController.js # Ranking computation
│   │   ├── userController.js        # Profile & AP/RP management
│   │   └── chatController.js        # Group messaging logic
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── leaderboard.js
│   │   ├── users.js
│   │   └── chat.js
│   └── server.js                    # Entry point, middleware setup
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Configured Axios instance
│   │   ├── components/
│   │   │   ├── Sidebar.jsx          # Role-aware navigation
│   │   │   ├── Layout.jsx           # Page wrapper with sidebar
│   │   │   └── PrivateRoute.jsx     # Auth-protected route guard
│   │   ├── context/
│   │   │   └── AuthContext.js       # Global auth state (JWT + user)
│   │   ├── pages/
│   │   │   ├── Login.jsx            # ✅ Complete
│   │   │   ├── Dashboard.jsx        # ✅ Complete
│   │   │   ├── Tasks.jsx            # ✅ Complete
│   │   │   ├── Leaderboard.jsx      # ✅ Complete
│   │   │   ├── Profile.jsx          # ✅ Complete
│   │   │   ├── Chat.jsx             # 🟡 In Progress
│   │   │   ├── Projects.jsx         # 🔵 Planned
│   │   │   └── Meetings.jsx         # 🔵 Planned
│   │   └── App.js                   # Router, route definitions
│   └── public/
│
└── README.md
```

---

## 🗄️ Database Schema

### `users`
```sql
CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) UNIQUE NOT NULL,
  password   VARCHAR(255) NOT NULL,        -- bcrypt hashed
  role       ENUM('Captain','Vice-Captain','Manager','Strategist','Member'),
  ap_points  INT DEFAULT 0,               -- Achievement Points
  rp_points  INT DEFAULT 0                -- Reputation Points
);
```

### `tasks`
```sql
CREATE TABLE tasks (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to INT REFERENCES users(id),
  created_by  INT REFERENCES users(id),
  priority    ENUM('Low','Medium','High','Critical'),
  status      ENUM('Pending','In Progress','Completed','Blocked'),
  deadline    DATE
);
```

### `chat_groups`
```sql
CREATE TABLE chat_groups (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  created_by INT REFERENCES users(id),
  is_general BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `group_members`
```sql
CREATE TABLE group_members (
  id       INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT REFERENCES chat_groups(id),
  user_id  INT REFERENCES users(id)
);
```

### `chat_messages`
```sql
CREATE TABLE chat_messages (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  group_id   INT REFERENCES chat_groups(id),
  sender_id  INT REFERENCES users(id),
  message    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> 📊 **Leaderboard** is derived dynamically from `users.ap_points + users.rp_points` — no separate table required.

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js `v18+`
- MySQL `v8+`
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/innovatex.git
cd innovatex
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=innovatex
JWT_SECRET=your_super_secret_key
PORT=5000
```

Initialize the database:

```bash
mysql -u root -p < schema.sql
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

> The frontend runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## 🌿 Team Workflow

### Branching Strategy

```
main             ← Production-ready, protected
└── dev          ← Active integration branch
    ├── feat/auth
    ├── feat/tasks
    ├── feat/leaderboard
    ├── feat/chat-frontend
    └── fix/[issue-name]
```

### Pull Request Rules

| Rule | Detail |
|------|--------|
| 🔒 Direct push to `main` | ❌ Never allowed |
| ✅ PR to `dev` | Required for all features |
| 👥 Reviewers | Minimum 1 team member approval |
| 🧪 Tests | Must pass before merge |
| 📝 PR Description | Must include: what changed, why, how to test |

### Commit Convention

```
feat:     New feature
fix:      Bug fix
chore:    Dependency or config update
refactor: Code restructure (no behavior change)
docs:     Documentation only
```

---

## 🎯 Current Focus

| Priority | Task | Owner |
|----------|------|-------|
| 🔴 High | Complete Chat frontend (UI + socket prep) | Frontend |
| 🔴 High | Projects module — schema + API | Backend + DB |
| 🟡 Medium | Meetings module scaffold | Frontend |
| 🟡 Medium | Integration testing (auth + tasks flow) | QA/Integration |
| 🟢 Low | UI polish & mobile responsiveness | Frontend |

---

## 🔮 Future Vision

InnovateX aims to evolve from a team project into a **fully deployable student collaboration SaaS**:

- 📡 **Real-time everything** — live task updates, instant messaging, live leaderboard via Socket.io
- 🤖 **AI Suggestions** — smart task assignment based on member skills and past performance
- 🏫 **Multi-team support** — isolated team spaces with admin controls
- 📱 **Mobile app** — React Native companion
- 🔗 **LMS integration** — connect with Google Classroom, Notion, or Canvas
- 🌐 **Cloud deployment** — Docker + CI/CD pipeline on AWS/GCP

---

## 💡 Sample Use Case

> **Scenario**: A 4-person final year project team uses InnovateX for their semester project.

1. **Captain** creates the project and invites team members with assigned roles.
2. **Manager** creates tasks, sets priorities and deadlines, assigns them to members.
3. **Members** update task status as they work — earning **AP points** on completion.
4. **Strategist** monitors the leaderboard and adjusts team focus.
5. **Vice-Captain** reviews progress on the Dashboard and flags blockers.
6. All members communicate via **Chat groups** (General + role-specific channels).
7. At sprint end, the **Leaderboard** reflects individual contribution — gamifying productivity.

---

<div align="center">

---

**InnovateX** · Built with 💻 by a team of 4

*Turning student collaboration into a professional-grade experience.*

</div>
