import { useEffect, useRef, useState } from "react";
import { Activity, Apple, Dumbbell, Footprints, LogOut, Plus, Trash2, UserRound, Flame } from "lucide-react";

const API = "http://localhost:5000/api";
const readUser = () => {
  try { return JSON.parse(localStorage.getItem("fittrack_user") || "null"); }
  catch { return null; }
};

// Child component receives data and event handlers through props.
const StatCard = ({ icon: Icon, label, value, unit, tone }) => (
  <article className="stat-card">
    <span className={`stat-icon ${tone}`}><Icon size={20} /></span>
    <p>{label}</p><strong>{value}</strong><small>{unit}</small>
  </article>
);

const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError(""); setBusy(true);
    try {
      const response = await fetch(`${API}/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed.");
      onAuth(data);
    } catch (err) { setError(err.message || "Cannot reach server. Is it running?"); }
    finally { setBusy(false); }
  };

  return <main className="auth-layout">
    <section className="auth-brand">
      <div className="brand"><span className="brand-mark"><Activity /></span> FITTRACK<span className="brand-light">PRO</span></div>
      <div><span className="eyebrow">YOUR ROUTINE. YOUR RESULTS.</span><h1>Build strength.<br/><em>Track progress.</em></h1>
      <p>Your personal space to stay consistent with training, nutrition and daily movement.</p></div>
      <div className="auth-foot">TRAIN SMART · LIVE STRONG</div>
    </section>
    <section className="auth-panel">
      <div className="auth-box">
        <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "START YOUR JOURNEY"}</span>
        <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
        <p className="muted">Your fitness journey starts with one step.</p>
        <div className="tabs"><button className={mode === "login" ? "active" : ""} onClick={() => {setMode("login");setError("");}}>Login</button><button className={mode === "register" ? "active" : ""} onClick={() => {setMode("register");setError("");}}>Register</button></div>
        <form onSubmit={submit} className="form-stack">
          {mode === "register" && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" autoComplete="name" required /></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary-btn" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
        </form>
        <p className="tiny-note">Protected with password hashing and JWT authentication.</p>
      </div>
    </section>
  </main>;
};

const EntryForm = ({ onAdd, formRef }) => {
  const [form, setForm] = useState({ type: "Workout", title: "", detail: "", value: "" });
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setSaving(true);
    const ok = await onAdd({ ...form, value: Number(form.value) || 0 });
    if (ok) setForm({ type: "Workout", title: "", detail: "", value: "" });
    setSaving(false);
  };
  return <form className="entry-form" ref={formRef} onSubmit={submit}>
    <div className="form-grid">
      <label>Activity type<select name="type" value={form.type} onChange={update}><option>Workout</option><option>Meal</option><option>Steps</option></select></label>
      <label>Title<input name="title" value={form.title} onChange={update} placeholder="e.g. Push day" required maxLength={100}/></label>
      <label>Details<input name="detail" value={form.detail} onChange={update} placeholder="e.g. Chest + triceps" maxLength={300}/></label>
      <label>{form.type === "Steps" ? "Step count" : form.type === "Workout" ? "Minutes" : "Calories (kcal)"}<input name="value" type="number" min="0" value={form.value} onChange={update} placeholder="0"/></label>
    </div>
    <button className="primary-btn add-btn" disabled={saving}><Plus size={17}/>{saving ? "Saving…" : "Add entry"}</button>
  </form>;
};

const Dashboard = ({ user, token, onLogout }) => {
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState(sessionStorage.getItem("fittrack_tab") || "Overview");
  const [notice, setNotice] = useState("");
  const formRef = useRef(null);
  const titleRef = useRef(null);

  const request = async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed.");
    return data;
  };

  const loadEntries = async () => {
    try { setEntries(await request("/tracker")); }
    catch (error) { setNotice(error.message); }
  };
  useEffect(() => { loadEntries(); }, []);

  const addEntry = async (entry) => {
    try {
      const saved = await request("/tracker", { method: "POST", body: JSON.stringify(entry) });
      setEntries((current) => [saved, ...current]); setNotice("Entry saved successfully."); return true;
    } catch (error) { setNotice(error.message); return false; }
  };
  const deleteEntry = async (id) => {
    try { await request(`/tracker/${id}`, { method: "DELETE" }); setEntries((current) => current.filter((item) => item._id !== id)); }
    catch (error) { setNotice(error.message); }
  };
  const changeTab = (next) => { setTab(next); sessionStorage.setItem("fittrack_tab", next); };
  const focusForm = () => { formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); titleRef.current?.focus(); };

  const workouts = entries.filter((entry) => entry.type === "Workout");
  const meals = entries.filter((entry) => entry.type === "Meal");
  const steps = entries.filter((entry) => entry.type === "Steps").reduce((sum, item) => sum + item.value, 0);
  const totalMinutes = workouts.reduce((sum, item) => sum + item.value, 0);

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark"><Activity/></span> FITTRACK<span className="brand-light">PRO</span></div>
      <div className="side-label">MENU</div>
      {["Overview", "Activity log"].map((item) => <button key={item} onClick={() => changeTab(item)} className={`nav-item ${tab === item ? "selected" : ""}`}><Activity size={18}/>{item}</button>)}
      <div className="side-bottom"><div className="profile"><span className="avatar"><UserRound size={18}/></span><div><strong>{user.name}</strong><small>{user.email}</small></div></div><button className="logout" onClick={onLogout}><LogOut size={17}/> Log out</button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">MONDAY MOTIVATION, EVERY DAY</span><h2>{tab === "Overview" ? "Your dashboard" : "Activity log"}</h2></div><button className="primary-btn top-add" onClick={focusForm}><Plus size={17}/> Add activity</button></header>
      <section className="welcome"><div><span className="eyebrow">KEEP SHOWING UP</span><h1>Hey, {user.name.split(" ")[0]} <span>👋</span></h1><p>Small steps every day lead to big results. Let's get moving.</p></div><div className="welcome-art"><Flame size={48}/><span>STAY<br/>CONSISTENT</span></div></section>
      <div className="stats-grid">
        <StatCard icon={Dumbbell} label="Workouts logged" value={workouts.length} unit="sessions" tone="green"/>
        <StatCard icon={Apple} label="Meals logged" value={meals.length} unit="entries" tone="orange"/>
        <StatCard icon={Footprints} label="Steps recorded" value={steps.toLocaleString()} unit="total steps" tone="blue"/>
        <StatCard icon={Flame} label="Training time" value={totalMinutes} unit="minutes" tone="purple"/>
      </div>
      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <section className="content-card" id="add-activity"><div className="section-heading"><div><span className="eyebrow">MAKE IT COUNT</span><h3>Log an activity</h3></div><span className="section-number">01</span></div><EntryForm onAdd={addEntry} formRef={formRef}/></section>
      <section className="content-card"><div className="section-heading"><div><span className="eyebrow">YOUR JOURNEY</span><h3>Recent activity</h3></div><span className="section-number">02</span></div>
        {entries.length === 0 ? <div className="empty"><Activity size={28}/><strong>No activities yet</strong><span>Add your first workout, meal or step count above.</span></div> :
          <div className="entry-list">{entries.map((entry) => <article className="entry-row" key={entry._id}><span className={`entry-symbol ${entry.type.toLowerCase()}`}>{entry.type === "Workout" ? <Dumbbell/> : entry.type === "Meal" ? <Apple/> : <Footprints/>}</span><div className="entry-info"><strong>{entry.title}</strong><span>{entry.type}{entry.detail ? ` · ${entry.detail}` : ""}</span></div><div className="entry-value">{entry.value ? `${entry.value.toLocaleString()} ${entry.type === "Steps" ? "steps" : entry.type === "Workout" ? "min" : "kcal"}` : "—"}</div><button className="icon-btn" aria-label="Delete entry" onClick={() => deleteEntry(entry._id)}><Trash2 size={17}/></button></article>)}</div>}
      </section>
      <footer>FITTRACK PRO <span>Built for consistency, not perfection.</span></footer>
    </main>
  </div>;
};

export default function App() {
  const [auth, setAuth] = useState(() => ({ token: localStorage.getItem("fittrack_token"), user: readUser() }));
  const handleAuth = (data) => {
    localStorage.setItem("fittrack_token", data.token);
    localStorage.setItem("fittrack_user", JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
  };
  const logout = () => {
    localStorage.removeItem("fittrack_token"); localStorage.removeItem("fittrack_user");
    sessionStorage.removeItem("fittrack_tab"); setAuth({ token: null, user: null });
  };
  if (!auth.token || !auth.user) return <AuthScreen onAuth={handleAuth}/>;
  return <Dashboard user={auth.user} token={auth.token} onLogout={logout}/>;
}
