![StudyBuddy Logo](https://github.com/user-attachments/assets/351fdd6e-4bd1-466b-9114-83da6d208a42)

# 📚 StudyBuddy – Intelligent Collaborative Study Platform

**StudyBuddy** is a full-featured, intelligent web platform designed to enhance collaborative learning. It helps students discover study resources, find ideal partners and groups, interact in real-time, and track their learning progress – all personalized to their preferences.

---

## 🌟 Features

### ✅ 1. Onboarding

- 🔐 Secure **login/signup** using **NextAuth.js (Credentials provider)**
- 📝 Registration page to collect preferences
- 🔄 Update preferences post-login
- 🖼️ Upload and display **avatar**
- 🔧 Update avatars from Dashboard

---

### ✅ 2. Resource Discovery

- 🎯 **Resources Recommendation** filters based on:
  - Subjects
  - Academic Level
  - Availability overlap
- 🎛️ `/discover` page with interactive filter UI
- 📚 Dynamic rendering of:
  - `GroupCard`
  - `ResourceCard`
- 🧩 Interactive components:
  - `QuizPlayer` with score + timer
  - `TutorialViewer` with progress + auto-complete
- 📖 `/learn` page for:
  - Available and Completed quizzes/tutorials

---

### ✅ 3. Group Selection & Matching

- ➕ Join / Leave groups
- 🤝 Matchmaking via preference similarity
- 🎯 `Groups` and `Dashboard` pages display:
  - Joined groups
  - Match suggestions
- ⭐ **Group Feedback UI**:
  - `GroupFeedbackForm` integration
  - `Average Rating` display and update
- 📨 **Study Partner Request**:
  - Request → Approval → Private Chat

---

### ✅ 4. Real-Time Collaboration

- ⚡ **WebSocket + Socket.IO integration**
- 💬 **Group Chat**:
  - Real-time messaging
  - Sender tracking
  - Persistent history (MongoDB)
- 🧑‍🎨 **Whiteboard**:
  - Built using Konva + Socket.IO
  - Group-session scoped collaborative drawing
- 🔔 **Notifications**:
  - Match found
  - Session reminders
  - New chat messages (React-Toastify)

---

### ✅ 5. Post-Session Feedback

- ⭐ Rate resources via `FeedbackForm`
- 🔁 Feedback saved to `interactionHistory`
- 📊 Resources show **average rating**
- 🔎 Filter by rating in `/discover`
- ✅ Group feedback integrated with group section

---

## 🧱 Tech Stack

| Frontend           | Backend            | Database       | Auth         | Real-Time        |
|--------------------|--------------------|----------------|--------------|------------------|
| React + Next.js    | Node.js + Express  | MongoDB Atlas  | NextAuth.js  | Socket.IO        |
| TailwindCSS        | REST API Routes    | Mongoose ORM   | JWT Sessions | WebSockets       |
| Konva.js           |                    |                |              |                  |

---

## 🖼️ Screenshots

### Home | Discover | Group Chat

| Home | Discover | Private Chat |
|------|----------|--------------|
| ![home1](https://github.com/user-attachments/assets/8432dbc4-ca1f-441b-8b2e-3c6026f0b2c5) | ![discover](https://github.com/user-attachments/assets/3880844a-6fa9-4a99-a562-8848e26c7b07) | ![pchat](https://github.com/user-attachments/assets/249aa18c-f303-4518-a162-0225b736bc07) |

### Dashboard | Create Group | Groups

| Dashboard | Create Group | Groups |
|-----------|--------------|--------|
| ![d1](https://github.com/user-attachments/assets/640644ce-cc09-4850-8fb6-5ee2cdddb02a) | ![create](https://github.com/user-attachments/assets/bc8d823e-be37-4440-8e4b-874a1b981f93) | ![groups](https://github.com/user-attachments/assets/1a2c1cb2-60d3-40c7-8fd0-e70c47911207) |

### Learn | Quiz Player | Tutorial Viewer

| Learn | Quiz Player | Tutorial Viewer |
|-------|--------------|-----------------|
| ![learn-quiz](https://github.com/user-attachments/assets/dbc2b8d7-d183-4715-bb13-42637fa26252) | ![quiz](https://github.com/user-attachments/assets/ce0e144a-2d77-48df-843a-1a7b9ecdfbbc) | ![tutor](https://github.com/user-attachments/assets/e4298687-9701-47ee-b0a0-1eb141285dda) |

### Whiteboard

| Whiteboard |
|------------|
| ![whiteboard](https://github.com/user-attachments/assets/9e11360a-1705-4996-a181-6a52cc70bbc4) |

---
