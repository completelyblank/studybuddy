![StudyBuddy Logo]](https://github.com/user-attachments/assets/351fdd6e-4bd1-466b-9114-83da6d208a42)

# 📚 StudyBuddy - Intelligent Collaborative Study Platform

StudyBuddy is a full-featured, intelligent web platform designed to enhance collaborative learning. It helps students discover study resources, find ideal partners and groups, interact in real-time, and track their learning progress – all personalized to their preferences.

---

## 🌟 Features

### ✅ 1. Onboarding

- 🔐 Secure **login/signup** using **NextAuth.js (Credentials provider)**
- 📝 **Registration page** to collect preferences
- 🔄 Update preferences post-login
- 🖼️ Upload and display **avatar**
- 🔧 Update avatars

---

### ✅ 2. Resource Discovery

- 🎯 `Resources Recommendation` filters based on:
  - Subjects
  - Academic Level
  - Availability overlap
- 🎛️ `Discover` page with interactive **filter UI**
- 📚 Dynamic rendering of:
  - `GroupCard`
  - `ResourceCard`
- 🧩 Interactive components:
  - `QuizPlayer` with score and timer
  - `TutorialViewer` with progress and completion
- 📖 `Learn` page showing:
  - Available + Completed quizzes/tutorials

---

### ✅ 3. Group Selection & Matching

- ➕ Join/Leave groups
- 🤝 Matchmaking using **preference similarity**
- 🎯 `Groups` and `Dashboard` show:
  - Joined groups
  - Match suggestions
- ⭐ **Group Feedback UI**:
  - Integrated `GroupFeedbackForm`
  - ⭐ `Average Rating` displayed
- 📨 **Study partner request flow**:
  - Request → Approval → Private Chat

---

### ✅ 4. Real-Time Collaboration

- ⚡ **WebSocket + Socket.IO integration**
- 💬 **Group Chat**:
  - Real-time messages
  - Sender tracking
  - Persistent history via MongoDB
- 🧑‍🎨 **Whiteboard**:
  - Built with Konva + Socket.IO
  - Collaborative drawing
- 🔔 **Notifications**:
  - Match found
  - Session reminders
  - New chat messages

---

### ✅ 5. Post-Session Feedback

- ⭐ Rate resources with `FeedbackForm`
- 🔁 Feedback stored + updates `Interaction History`
- 📊 Resources show **average rating**
- 🔎 Filter by rating in `Discover`
- ✅ Group feedback handled under group selection section

---

## 🧱 Tech Stack

| Frontend                | Backend            | Database       | Auth         | Real-Time        |
|------------------------|--------------------|----------------|--------------|------------------|
| React + Next.js        | Node.js + Express  | MongoDB Atlas  | NextAuth.js  | Socket.IO        |
| TailwindCSS + Konva.js | REST API structure | Mongoose ORM   | JWT Sessions | WebSockets       |

---

## 🖼️ Screenshots

| Home Page | Discover Page | Group Chat |
|-----------|----------------|------------|
| <img width="960" alt="home1" src="https://github.com/user-attachments/assets/8432dbc4-ca1f-441b-8b2e-3c6026f0b2c5" />
 | <img width="960" alt="discover" src="https://github.com/user-attachments/assets/3880844a-6fa9-4a99-a562-8848e26c7b07" />
| <img width="960" alt="pchat" src="https://github.com/user-attachments/assets/249aa18c-f303-4518-a162-0225b736bc07" />
 |

| Dashboard | Create Group | Groups |
|-----------|---------------|--------|
| <img width="960" alt="d1" src="https://github.com/user-attachments/assets/640644ce-cc09-4850-8fb6-5ee2cdddb02a" /> | <img width="960" alt="create" src="https://github.com/user-attachments/assets/bc8d823e-be37-4440-8e4b-874a1b981f93" /> | <img width="960" alt="groups" src="https://github.com/user-attachments/assets/1a2c1cb2-60d3-40c7-8fd0-e70c47911207" /> |

### Learn | Quiz Player | Tutorial Viewer

| Learn | Quiz Player | Tutorial Viewer |
|-------|--------------|-----------------|
| <img width="960" alt="learn-quiz" src="https://github.com/user-attachments/assets/dbc2b8d7-d183-4715-bb13-42637fa26252" /> | <img width="960" alt="quiz" src="https://github.com/user-attachments/assets/ce0e144a-2d77-48df-843a-1a7b9ecdfbbc" /> | <img width="960" alt="tutor" src="https://github.com/user-attachments/assets/e4298687-9701-47ee-b0a0-1eb141285dda" /> |

### Whiteboard

| Whiteboard |
|------------|
| <img width="960" alt="whiteboard" src="https://github.com/user-attachments/assets/9e11360a-1705-4996-a181-6a52cc70bbc4" /> |

---
