# TaskFlow Backend 🚀

TaskFlow is a modern, high-performance Kanban board application with AI-powered task estimations. This is the backend service built with Node.js, Express, and MongoDB.

##  Tech Stack & Libraries
- **Runtime Environment:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ORM)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Validation:** Zod
- **AI Integration:** Groq SDK
- **Testing:** Jest, Supertest, Mongo Memory Server

##  LLM API Selection
**Chosen API:** Groq (Model: `llama-3.1-8b-instant`)

**Why Groq?** Groq provides ultra-fast inference speeds using their custom LPU architecture. For a productivity tool where users request task effort/due date estimations, returning AI responses instantly without UI blocking is critical for a smooth user experience.

**How the AI Feature Works:** 
When a user types a task title and description on the frontend, a request is sent to `POST /api/tasks/suggest-estimate`. The backend constructs a highly specific prompt and forwards it to the Groq API. Groq processes the context and returns a JSON payload containing an estimated effort duration (e.g., "2 hours"), a suggested due date, and a brief reasoning. The backend parses this JSON and returns it to the frontend to auto-fill the form.

## ⚙️ Setup & Local Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on the provided `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   *(Server will run on `http://localhost:5000`)*

5. **Run Integration Tests:**
   ```bash
   npm test
   ```

## 🔐 Environment Variables (`.env.example`)

```env
# Server Port
PORT=5000

# MongoDB Connection URI (Local or Atlas)
MONGO_URI=mongodb://localhost:27017/taskflow

# JSON Web Token Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Groq API Key for AI Estimations
GROQ_API_KEY=gsk_your_groq_api_key_here

# Frontend URL (For CORS configuration in Production)
FRONTEND_URL=https://your-frontend.onrender.com
```

##  API Documentation

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token

### Boards
- `GET /api/boards` - Get all boards for the authenticated user
- `POST /api/boards` - Create a new board
- `GET /api/boards/:id` - Get a specific board by ID
- `DELETE /api/boards/:id` - Delete a board and its associated tasks

### Tasks
- `GET /api/tasks/all` - Get all tasks across all boards (used for Analytics Dashboard)
- `GET /api/tasks?boardId={id}` - Get all tasks for a specific board
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task (used for Drag & Drop status updates)
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/suggest-estimate` - Generate AI time estimations for a task

## 🔗 Links & Credentials
- **Live Backend API:** `[Insert Render Backend URL Here]`
- **Frontend Live Demo:** `[Insert Render Frontend URL Here]`
- **Test Credentials:** 
  - Email: `test@test.com`
  - Password: `password123`

## ⚠️ Known Issues & Future Improvements
- **Issue:** The AI estimator occasionally returns malformed JSON if the prompt constraints are ignored by the LLM. It currently falls back gracefully, but structural enforcement could be stricter.
- **Improvement:** Implement WebSockets (Socket.io) for real-time collaboration so multiple users can move cards on the same board simultaneously.
- **Improvement:** Implement server-side pagination for tasks to optimize performance for boards with thousands of tasks.
