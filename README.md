# ResolveX — Full-Stack MERN Complaint Management System

A production-grade, enterprise-ready **MERN (MongoDB, Express.js, React.js, Node.js)** web application built to simplify grievance lodging, automate resolution workflows, facilitate bidirectional real-time user-agent communication with **Socket.io**, and provide visual analytical intelligence for administrators.

---

## 🎨 Color Theme & Design System
Crafted with a modern, high-contrast palette:
- 🟣 **Purple / Electric Indigo (`#7c3aed`, `#6366f1`)**: Primary brand accents, action buttons, active navigation states.
- 🔵 **Blue / Cyan (`#3b82f6`, `#0ea5e9`)**: In-progress status, agent workspace tools, links, and filters.
- 🟡 **Yellow / Amber (`#f59e0b`, `#fbbf24`)**: Pending status, medium priority badges, 5-star rating highlights.
- 🟢 **Green / Mint (`#10b981`, `#34d399`)**: Resolved status, success indicators, high CSAT ratings.
- 🔴 **Red / Rose (`#ef4444`, `#f43f5e`)**: Urgent priority, rejected tickets, account deactivation.

---

## 🚀 Key Features

### 1. Multi-Role Authentication & Access Control
- **JWT & bcryptjs Security**: Secure stateless token authentication with password hashing.
- **Three Distinct Roles**:
  - `USER`: Register complaints, track ticket lifecycle progress, chat with agents, submit post-resolution 5-star feedback.
  - `AGENT`: Manage assigned complaint queue, execute lifecycle state transitions (Pending ➔ In Progress ➔ Resolved), communicate in real-time, record verified resolution notes.
  - `ADMIN`: Dispatch tickets to agents, monitor system-wide KPIs and performance scorecards, manage user permissions, delete tickets.
- **⚡ 1-Click Fast Demo Switcher**: Instant testing switch in the top navigation bar to test all three roles with pre-seeded accounts in a single click.

### 2. Complaint Submission & Lifecycle Tracking
- Unique auto-generated Ticket IDs (e.g. `TKT-1024`, `TKT-2048`).
- Categorization across **Technical**, **Billing**, **Hardware**, **Service**, and **Product**.
- Priority management (**Low**, **Medium**, **High**, **Urgent** with animated glowing indicators).
- Visual Horizontal Stepper & Vertical Audit Feed documenting timestamped actions and status changes.
- File and screenshot attachments support via Multer.

### 3. Real-Time User ↔ Agent Chat (Socket.io)
- Dedicated WebSocket room per complaint ticket (`ticket_<id>`).
- Real-time bidirectional message updates without page refreshes.
- Live typing indicator (`"David Miller is typing..."`).
- Timestamped message bubbles with role pill tags (`USER`, `AGENT`, `ADMIN`).

### 4. Post-Resolution Feedback & Rating System
- Interactive 5-star rating modal with celebratory confetti animations (`canvas-confetti`).
- Tag sentiment chips (*Lightning Fast*, *Clear Solution*, *Polite & Professional*).
- Average CSAT score calculation reflected across agent scorecards and admin dashboards.

### 5. Admin Analytics & Executive Dashboard
- Visual Progress Bar Status Breakdown.
- Categorical breakdown and weekly ticket trends.
- **Agent Workload & Performance Leaderboard** tracking assigned vs resolved counts, turnaround rates, and customer satisfaction scores.
- Comprehensive Complaint Matrix and User Management tables.

### 6. Public Guest Ticket Tracker
- Search and monitor real-time ticket progress by Ticket ID (e.g. `TKT-1024`) without logging in.

---

## 👥 Demo Login Credentials

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Alex Vance | `admin@complaint.com` | `admin123` |
| **Agent (Tech)** | David Miller | `agent.tech@complaint.com` | `agent123` |
| **Agent (Billing)**| Elena Rostova | `agent.billing@complaint.com` | `agent123` |
| **User** | John Doe | `john@user.com` | `user123` |
| **User** | Sarah Connor | `sarah@user.com` | `user123` |

*(You can also use the **1-Click Switch** dropdown in the top navbar for immediate access)*

---

## 🛠️ Project Structure

```
c:/complaint system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Resilient DB connector (with memory-server fallback)
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile, user list
│   │   │   ├── complaintController.js# CRUD, workflow transitions, agent assignment
│   │   │   ├── messageController.js  # Live chat history & message persistence
│   │   │   ├── feedbackController.js # 5-star rating submissions & statistics
│   │   │   └── analyticsController.js# KPI metrics, category breakdowns & leaderboard
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification & role authorization
│   │   │   ├── validator.js          # Express-validator schema rules
│   │   │   ├── errorHandler.js       # Centralized error handler
│   │   │   └── upload.js             # Multer attachment handler
│   │   ├── models/
│   │   │   ├── User.js               # User schema with bcrypt & role enums
│   │   │   ├── Complaint.js          # Ticket schema with timeline history
│   │   │   ├── Message.js            # Chat message schema
│   │   │   └── Feedback.js           # Rating & review schema
│   │   ├── routes/                   # Modular REST endpoints
│   │   ├── utils/
│   │   │   └── seeder.js             # Initial demo database seeder
│   │   └── server.js                 # Express server + Socket.io gateway
│   ├── test-integration.js           # Full-stack integration test suite
│   ├── .env                          # Environment configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation & 1-click role switcher
│   │   │   ├── Footer.jsx            # Responsive footer
│   │   │   ├── StatusBadge.jsx       # Color-coded status badge
│   │   │   ├── PriorityBadge.jsx     # Priority indicators
│   │   │   ├── StatsCard.jsx         # KPI metric card
│   │   │   ├── Timeline.jsx          # Lifecycle stepper & audit feed
│   │   │   ├── ChatBox.jsx           # Real-time WebSocket chat room
│   │   │   ├── NewComplaintModal.jsx # Grievance filing modal
│   │   │   ├── FeedbackModal.jsx     # 5-star rating modal with confetti
│   │   │   ├── AssignAgentModal.jsx  # Admin dispatch dialog
│   │   │   └── ResolutionModal.jsx   # Agent resolution dialog
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state & session persistence
│   │   │   └── SocketContext.jsx     # Socket.io provider & events
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing page & quick search
│   │   │   ├── Login.jsx             # Login with 1-click shortcuts
│   │   │   ├── Register.jsx          # Account registration
│   │   │   ├── UserDashboard.jsx     # User complaints overview
│   │   │   ├── AgentDashboard.jsx    # Assigned tickets queue
│   │   │   ├── AdminDashboard.jsx    # Analytics charts & matrix
│   │   │   ├── ComplaintDetails.jsx  # Dedicated ticket workspace
│   │   │   └── PublicTracker.jsx     # Public guest ticket tracker
│   │   ├── services/
│   │   │   └── api.js                # Axios instance & typed API client
│   │   ├── index.css                 # Vibrant CSS theme tokens & utilities
│   │   ├── App.jsx                   # React Router with role guards
│   │   └── main.jsx
│   └── package.json
└── package.json                      # Root workspace scripts
```

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
# In the root directory:
npm run install:all
```

### 2. Seed Initial Database
```bash
npm run seed
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
```
- **Backend API & WebSockets**: `http://localhost:5000`
- **Frontend Application**: `http://localhost:3000`

---

## 🧪 Automated Testing
Run the comprehensive integration test suite:
```bash
node backend/test-integration.js
```
Expected output:
```
🧪 Starting Full-Stack API & Workflow Integration Tests...

  ✅ [PASS] Health check responds 200 OK
  ✅ [PASS] User authentication & JWT token issuance
  ✅ [PASS] Agent authentication with role verification
  ✅ [PASS] Admin authentication with role verification
  ✅ [PASS] Complaint creation with generated Ticket ID: TKT-XXXX
  ✅ [PASS] Admin ticket assignment to support agent
  ✅ [PASS] User sends ticket chat message
  ✅ [PASS] Agent replies in ticket chat
  ✅ [PASS] Agent updates complaint status to In Progress
  ✅ [PASS] Agent resolves complaint with notes
  ✅ [PASS] User submits 5-star resolution feedback
  ✅ [PASS] Public ticket tracking lookup by Ticket ID
  ✅ [PASS] Admin analytics KPIs and category aggregations

🎉 Test Suite Completed: 13/13 tests passed successfully!
```
