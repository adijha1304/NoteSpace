import React from "react";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, ChevronDown, Clock3, FilePlus2, LogOut, Menu, MoreHorizontal, NotebookPen, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const colors = ["violet", "blue", "green", "amber", "rose"];
const blank = { title: "", content: "", color: "violet" };
const dateLabel = (date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const preview = (value) => value?.trim().replace(/\s+/g, " ") || "No additional text";

export default function NotesPage() {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  async function loadNotes() {
    try { const { data } = await api.get("/notes"); setNotes(data); }
    catch { setNotice("Couldn't load your notes. Please refresh."); }
  }
  useEffect(() => { loadNotes(); }, []);

  const filtered = useMemo(() => notes.filter(n => `${n.title} ${n.content}`.toLowerCase().includes(query.toLowerCase())), [notes, query]);
  const current = notes.find(n => n.id === selected);

  function startNew() { setSelected(null); setDraft(blank); setEditing(true); setMobileSidebar(false); setNotice(""); }
  function openNote(note) { setSelected(note.id); setDraft({ title: note.title, content: note.content, color: note.color }); setEditing(false); setMobileSidebar(false); setNotice(""); }

  async function saveNote(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setBusy(true); setNotice("");
    try {
      if (selected) {
        const { data } = await api.patch(`/notes/${selected}`, draft);
        setNotes(items => items.map(n => n.id === selected ? data : n));
      } else {
        const { data } = await api.post("/notes", draft);
        setNotes(items => [data, ...items]); setSelected(data.id);
      }
      setEditing(false);
    } catch (err) { setNotice(err.response?.data?.detail || "Unable to save this note."); }
    finally { setBusy(false); }
  }

  async function deleteNote() {
    if (!selected || !window.confirm("Delete this note? This cannot be undone.")) return;
    try {
      await api.delete(`/notes/${selected}`);
      setNotes(items => items.filter(n => n.id !== selected));
      setSelected(null); setDraft(blank); setEditing(false);
    } catch { setNotice("Unable to delete this note."); }
  }

  const greeting = user?.name?.split(" ")[0] || "there";

  return <div className="workspace">
    <aside className={`sidebar ${mobileSidebar ? "sidebar-open" : ""}`}>
      <div className="brand"><span className="brand-mark"><NotebookPen size={20}/></span> notespace</div>
      <button className="new-note-btn" onClick={startNew}><Plus size={18}/> New note <span>⌘ N</span></button>
      <div className="side-label">YOUR WORKSPACE</div>
      <button className="side-link active"><BookOpen size={17}/> All notes <span className="count">{notes.length}</span></button>
      <div className="side-bottom">
        <div className="storage-card"><div className="storage-icon"><Sparkles size={17}/></div><strong>Your ideas, in one place.</strong><p>Small notes can lead to big things.</p></div>
        <div className="profile-row"><div className="avatar">{greeting[0]?.toUpperCase()}</div><div className="profile-info"><strong>{user?.name}</strong><span>{user?.email}</span></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="icon-btn mobile-menu" onClick={() => setMobileSidebar(!mobileSidebar)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <span>/</span> <strong>All notes</strong></div>
        <div className="top-actions"><span className="secure-pill"><span/> Private workspace</span><div className="avatar small-avatar">{greeting[0]?.toUpperCase()}</div></div>
      </header>

      <div className="content-wrap">
        <div className="page-heading"><div><span className="eyebrow muted-eyebrow">YOUR PERSONAL LIBRARY</span><h1>All notes<span className="heading-period">.</span></h1><p>Good afternoon, {greeting}. What's on your mind?</p></div><button className="primary-btn create-top" onClick={startNew}><FilePlus2 size={17}/> Create note</button></div>

        <div className="notes-toolbar"><div className="notes-count">{notes.length} {notes.length === 1 ? "note" : "notes"} <span>·</span> Sorted by recently updated</div><label className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your notes…"/>{query && <button onClick={() => setQuery("")}><X size={14}/></button>}</label></div>

        <div className="notes-layout">
          <section className="notes-list">
            {filtered.length === 0 ? <div className="empty-list"><div className="empty-icon"><NotebookPen size={22}/></div><strong>{query ? "No matching notes" : "Your page is still blank"}</strong><p>{query ? "Try another search term." : "Create your first note and let the ideas flow."}</p>{!query && <button className="text-btn" onClick={startNew}>Create your first note <ArrowIcon/></button>}</div> :
              filtered.map(note => <button key={note.id} className={`note-row ${selected === note.id ? "selected" : ""}`} onClick={() => openNote(note)}><span className={`note-color ${note.color}`}></span><span className="note-row-copy"><strong>{note.title}</strong><span>{preview(note.content).slice(0, 75)}</span><small><Clock3 size={12}/> {dateLabel(note.updated_at)}</small></span><MoreHorizontal size={17} className="row-more"/></button>)}
          </section>

          <section className="editor-panel">
            {editing ? <form className="editor-form" onSubmit={saveNote}>
              <div className="editor-topline"><span className="editor-status"><span className="status-dot"/> {selected ? "EDITING NOTE" : "NEW NOTE"}</span><button type="button" className="icon-btn" onClick={() => {setEditing(false);if(!selected)setDraft(blank);}}><X size={18}/></button></div>
              <input className="title-input" value={draft.title} onChange={e => setDraft({...draft,title:e.target.value})} placeholder="Give your note a title…" maxLength="120" autoFocus required/>
              <textarea className="content-input" value={draft.content} onChange={e => setDraft({...draft,content:e.target.value})} placeholder="Start writing something wonderful…" maxLength="20000"/>
              <div className="editor-footer"><div className="color-picker"><span>COLOR</span>{colors.map(c => <button type="button" key={c} aria-label={`${c} note color`} className={`color-dot ${c} ${draft.color === c ? "chosen" : ""}`} onClick={() => setDraft({...draft,color:c})}/>)}</div><button className="primary-btn save-btn" disabled={busy}>{busy ? "Saving…" : <><Check size={16}/> Save note</>}</button></div>
            </form> : current ? <div className="note-view">
              <div className="editor-topline"><span className="editor-status"><span className="status-dot"/> YOUR NOTE</span><div className="view-actions"><button className="subtle-btn" onClick={() => setEditing(true)}>Edit note</button><button className="icon-btn danger-icon" title="Delete note" onClick={deleteNote}><Trash2 size={17}/></button></div></div>
              <span className={`view-color ${current.color}`}></span><h2>{current.title}</h2><div className="note-meta">Created {dateLabel(current.created_at)} <span>·</span> Updated {dateLabel(current.updated_at)}</div><div className="note-body">{current.content || <span className="placeholder-text">This note is empty. Edit it to add your thoughts.</span>}</div>
            </div> : <div className="welcome-editor"><div className="welcome-art"><div className="art-paper paper-back"></div><div className="art-paper paper-front"><span></span><span></span><span></span><i>✳</i></div></div><span className="eyebrow muted-eyebrow">A MOMENT FOR YOURSELF</span><h2>Your thoughts<br/>deserve a home.</h2><p>Select a note to read it, or start with a fresh page. No clutter, just clarity.</p><button className="primary-btn" onClick={startNew}><Plus size={17}/> Write a new note</button></div>}
          </section>
        </div>
        {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")}><X size={15}/></button></div>}
      </div>
      <footer className="app-footer"><span>✳</span> Made for the thoughts worth keeping <span className="footer-right">Your notes are private to your account</span></footer>
    </main>
  </div>;
}

function ArrowIcon() { return <span aria-hidden="true">↗</span>; }
