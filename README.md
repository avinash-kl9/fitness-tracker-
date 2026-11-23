# FitTrack Pro — Fitness Tracker Web App

A full-stack student project demonstrating:
- React components, props, arrow functions and hooks (`useState`, `useEffect`, `useRef`)
- Controlled registration, login and tracker forms
- Local Storage for JWT/session persistence and user preferences
- Session Storage for temporary UI state
- DOM interaction through React refs (`focus()` and `scrollIntoView()`)
- Node.js + Express REST API, MongoDB Atlas + Mongoose
- Password hashing with bcrypt and JWT authentication

## 1. Requirements
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- VS Code recommended

## 2. Configure the backend
Open a terminal:
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string and a long random JWT secret:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/fittrack?retryWrites=true&w=majority
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```
In MongoDB Atlas, create a database user and allow your development IP in Network Access. Do not commit `.env`.

Start the API:
```bash
npm run dev
```

## 3. Start the React frontend
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173.

## 4. Try it
1. Register with your name, email and password.
2. Log in.
3. Add a workout, meal or daily step count.
4. Refresh the page: your account and tracker entries are loaded from the API.
5. Log out to clear the local login state.

## API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/tracker` (JWT required)
- `POST /api/tracker` (JWT required)
- `DELETE /api/tracker/:id` (JWT required)

## Notes for a college demonstration
- `useState` controls UI and form state.
- `useEffect` restores login state and loads tracker entries.
- `useRef` focuses the activity field and scrolls to the tracker form.
- Components pass data and callbacks through props.
- Forms are controlled: each input uses `value` and `onChange`.
- Local Storage keeps the JWT between browser sessions; Session Storage stores the active dashboard tab.
- The backend validates inputs and hashes passwords before saving them.
- For a production deployment, prefer secure, HttpOnly cookies over storing JWTs in Local Storage, add rate limiting, stronger validation, HTTPS, and refresh-token rotation.
