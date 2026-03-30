import { useState, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#F5F6F8", surface:"#FFFFFF", border:"#E5E7EB",
  text:"#111827", textMid:"#6B7280", textLight:"#9CA3AF",
  today:"#7B68EE", todayBg:"#EEF2FF",
  dropBg:"#F0FDF4", dropBorder:"#22C55E",
  warn:"#F59E0B", warnBg:"#FFFBEB", warnBorder:"#FDE68A",
  holiday:"#EF4444", holidayBg:"#FEF2F2", holidayBorder:"#FCA5A5",
  shortFri:"#8B5CF6", shortFriBg:"#F5F3FF", shortFriBorder:"#DDD6FE",
};

// ─── PROJECTS ────────────────────────────────────────────────────────────────
const PROJECTS = [
  { id:"iza",         name:"Iza's Supermarket", short:"IZA",    color:"#F97316", light:"#FFF7ED", chip:"#FFEDD5" },
  { id:"gaucho",      name:"Gaúcho Mobile",     short:"GAUCHO", color:"#10B981", light:"#F0FDF4", chip:"#D1FAE5" },
  { id:"supermarcat", name:"My SupermarCAT",    short:"SCAT",   color:"#8B5CF6", light:"#F5F3FF", chip:"#EDE9FE" },
  { id:"izyhits",     name:"IzyHits",           short:"HITS",   color:"#0EA5E9", light:"#F0F9FF", chip:"#E0F2FE" },
];

const EVENT_TYPES = {
  sprint_start: { label:"Sprint Start",  icon:"▶", color:"#22C55E", bg:"#F0FDF4" },
  sprint_end:   { label:"Sprint End",    icon:"⏹", color:"#EF4444", bg:"#FEF2F2" },
  review:       { label:"Review",        icon:"🔍", color:"#EAB308", bg:"#FEFCE8" },
  pre_planning: { label:"Pre-Planning",  icon:"📋", color:"#06B6D4", bg:"#ECFEFF" },
  planning:     { label:"Planning",      icon:"🗓", color:"#8B5CF6", bg:"#F5F3FF" },
  build_go:     { label:"Build Go",      icon:"🚀", color:"#F97316", bg:"#FFF7ED" },
};

const AREAS   = ["Programação","Arte","Design","QA","Marketing","Produção","Som","Negócios","Outro"];
const LEVELS  = ["Estágio","Júnior","Pleno","Sênior","Lead","Diretor","Sócio"];
const PALETTE = ["#F97316","#10B981","#8B5CF6","#0EA5E9","#EC4899","#EAB308","#EF4444","#14B8A6","#6366F1","#84CC16","#F43F5E","#0284C7","#7C3AED","#D97706","#059669"];
const AREA_CLR = {
  "Programação":"#6366F1","Arte":"#EC4899","Design":"#8B5CF6","QA":"#EF4444",
  "Marketing":"#F97316","Produção":"#10B981","Som":"#14B8A6","Negócios":"#0EA5E9","Outro":"#9CA3AF",
};
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MONTHS_SH = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const WEEKDAYS  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const WD_SH     = ["D","S","T","Q","Q","S","S"];
const YEAR = 2026;

const EVENT_DESC = {
  sprint_start:"Início oficial da sprint.",
  sprint_end:"Último dia da sprint.",
  review:"Review com o time.",
  pre_planning:"Refinamento do backlog.",
  planning:"Planning da sprint.",
  build_go:"Build Go para QA ou loja.",
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INIT_POOL = [
  { id:1, name:"Ana",    initials:"AN", color:"#F97316", area:"Programação", level:"Sênior", title:"Dev Mobile",    pointsPerDay:8 },
  { id:2, name:"Carlos", initials:"CA", color:"#8B5CF6", area:"Programação", level:"Pleno",  title:"Dev Unity",     pointsPerDay:8 },
  { id:3, name:"Mia",    initials:"MI", color:"#EC4899", area:"Arte",        level:"Pleno",  title:"2D Artist",     pointsPerDay:6 },
  { id:4, name:"Pedro",  initials:"PE", color:"#10B981", area:"Programação", level:"Júnior", title:"Dev Backend",   pointsPerDay:6 },
  { id:5, name:"Leo",    initials:"LE", color:"#0EA5E9", area:"Marketing",   level:"Pleno",  title:"UA Manager",    pointsPerDay:5 },
  { id:6, name:"Julia",  initials:"JU", color:"#EAB308", area:"Design",      level:"Pleno",  title:"UI/UX Designer",pointsPerDay:6 },
  { id:7, name:"Rafael", initials:"RA", color:"#EF4444", area:"QA",          level:"Júnior", title:"QA Analyst",    pointsPerDay:5 },
];

const INIT_TEAMS = {
  iza:         [{ name:"Ana" },   { name:"Carlos" }],
  gaucho:      [{ name:"Pedro" }, { name:"Mia"    }],
  supermarcat: [{ name:"Mia" },   { name:"Carlos" }],
  izyhits:     [{ name:"Leo" },   { name:"Ana"    }],
};

const INIT_HOLIDAYS = {
  "2026-01-01":"holiday","2026-02-16":"holiday","2026-02-17":"holiday",
  "2026-04-03":"holiday","2026-04-21":"holiday","2026-05-01":"holiday",
  "2026-06-04":"holiday","2026-09-07":"holiday","2026-10-12":"holiday",
  "2026-11-02":"holiday","2026-11-15":"holiday","2026-11-20":"holiday",
  "2026-12-25":"holiday",
};

// ─── SPRINTS ──────────────────────────────────────────────────────────────────
function makeSprints(anchor, count) {
  return Array.from({ length: count }, function(_, i) {
    var s = new Date(anchor); s.setDate(s.getDate() + i * 14);
    var e = new Date(s);      e.setDate(e.getDate() + 13);
    return { num: i + 1, start: s, end: e };
  });
}
const SPRINTS_A = makeSprints(new Date(2026, 0, 7),  27);
const SPRINTS_B = makeSprints(new Date(2026, 0, 14), 27);
const PROJ_SP   = { iza:SPRINTS_A, izyhits:SPRINTS_A, gaucho:SPRINTS_B, supermarcat:SPRINTS_B };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}
function firstDow(y, m) { return new Date(y, m, 1).getDay(); }
function daysIn(y, m)   { return new Date(y, m + 1, 0).getDate(); }
function toDK(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}
function toInput(d) { return toDK(new Date(d)); }
function autoInit(n) { return n.split(" ").map(function(w){ return w[0]; }).join("").toUpperCase().slice(0, 2) || "??"; }

function dateRange(start, end) {
  var a = [], c = new Date(start);
  while (c <= end) { a.push(toDK(c)); c.setDate(c.getDate() + 1); }
  return a;
}

function sprintsOnDay(d) {
  return SPRINTS_A.map(function(s){ return Object.assign({}, s, { group:"A" }); })
    .concat(SPRINTS_B.map(function(s){ return Object.assign({}, s, { group:"B" }); }))
    .filter(function(s){ return d >= s.start && d <= s.end; });
}

function isWorkday(d) { var w = d.getDay(); return w !== 0 && w !== 6; }

function calcCapacity(person, sprint, absences, holidays) {
  var days = dateRange(sprint.start, sprint.end);
  var base = 0, lost = 0;
  days.forEach(function(dk) {
    var d = new Date(dk + "T12:00");
    if (!isWorkday(d)) return;
    var h = holidays[dk];
    if (h === "holiday") { lost += person.pointsPerDay; return; }
    if ((absences[person.name] || []).indexOf(dk) !== -1) { lost += person.pointsPerDay; return; }
    if (h === "short_friday") { base += person.pointsPerDay * 0.5; return; }
    base += person.pointsPerDay;
  });
  return { base: Math.round(base), lost: Math.round(lost) };
}

function computeWarnings(teams, absences) {
  var w = {};
  PROJECTS.forEach(function(proj) {
    w[proj.id] = {};
    (teams[proj.id] || []).forEach(function(m) {
      PROJ_SP[proj.id].forEach(function(sprint) {
        var sd = new Set(dateRange(sprint.start, sprint.end));
        var ov = (absences[m.name] || []).filter(function(d){ return sd.has(d); });
        if (!ov.length) return;
        if (!w[proj.id][sprint.num]) w[proj.id][sprint.num] = [];
        var ex = w[proj.id][sprint.num].find(function(x){ return x.name === m.name; });
        if (ex) ex.dates = ov; else w[proj.id][sprint.num].push({ name: m.name, dates: ov });
      });
    });
  });
  return w;
}

function buildEvents() {
  var uid = 1; var evs = [];
  PROJECTS.forEach(function(proj) {
    var isA = proj.id === "iza" || proj.id === "izyhits";
    PROJ_SP[proj.id].forEach(function(sp) {
      var build = new Date(sp.start); build.setDate(build.getDate() + (isA ? 9 : 10));
      function push(type, date) {
        evs.push({ id: uid++, type: type, project: proj.id, sprint: sp.num,
                   date: new Date(date), group: isA ? "A" : "B", notes: "" });
      }
      push("sprint_start", sp.start); push("planning", sp.start);
      push("sprint_end", sp.end);     push("review", sp.end);
      push("pre_planning", sp.end);   push("build_go", build);
    });
  });
  return evs;
}

function spawnGhost(label, color) {
  var el = document.createElement("div");
  el.style.cssText = "position:fixed;pointer-events:none;z-index:9999;background:" + color +
    ";border-radius:8px;padding:6px 12px;font-size:12px;color:#fff;font-family:Inter,sans-serif;" +
    "font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.18);opacity:0;white-space:nowrap;" +
    "top:-200px;left:-200px;transition:opacity 0.1s";
  el.textContent = label;
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.style.opacity = "1"; });
  return el;
}

// ─── TINY SHARED ─────────────────────────────────────────────────────────────
const IS = {
  width:"100%", boxSizing:"border-box", background:"#fff",
  border:"1.5px solid #E5E7EB", borderRadius:8,
  padding:"8px 10px", fontSize:13, color:T.text,
  fontFamily:"Inter,sans-serif", outline:"none",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:10, color:T.textLight, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      {children}
    </div>
  );
}

function Divider({ my }) {
  return <div style={{ height:1, background:T.border, margin:(my||14)+"px 0" }} />;
}

function STitle({ children }) {
  return <div style={{ fontSize:10, color:T.textLight, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:8 }}>{children}</div>;
}

function Av({ person, size }) {
  var sz = size || 26;
  if (!person) return null;
  return (
    <div style={{
      width:sz, height:sz, borderRadius:"50%",
      background:person.color || "#888", border:"2px solid #fff",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:sz * 0.32, color:"#fff", fontWeight:700, flexShrink:0,
    }}>
      {(person.initials || person.name || "?").slice(0,1)}
    </div>
  );
}

function CapBar({ total, lost, max, color }) {
  var pct = max > 0 ? Math.round((total / max) * 100) : 0;
  var barColor = pct < 50 ? "#EF4444" : pct < 75 ? T.warn : (color || "#22C55E");
  return (
    <div>
      <div style={{ height:6, background:T.border, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:pct+"%", background:barColor, borderRadius:3, transition:"width 0.4s" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
        <span style={{ fontSize:9, color:barColor, fontWeight:700 }}>{total}pts</span>
        {lost > 0 && <span style={{ fontSize:9, color:"#EF4444" }}>-{lost}pts perdidos</span>}
      </div>
    </div>
  );
}

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
function Tooltip({ event, anchorRect, warnings, pool }) {
  var proj   = PROJECTS.find(function(p){ return p.id === event.project; });
  var ev     = EVENT_TYPES[event.type];
  var sprint = (PROJ_SP[event.project] || []).find(function(s){ return s.num === event.sprint; });
  var warn   = warnings && warnings[event.project] && warnings[event.project][event.sprint];
  var W = 260;
  var left = anchorRect.left + anchorRect.width / 2 - W / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - W - 8));
  var above = anchorRect.top > 170;
  return (
    <div style={{
      position:"fixed", left:left, zIndex:2000, width:W,
      top: above ? anchorRect.top - 8 : anchorRect.bottom + 8,
      transform: above ? "translateY(-100%)" : "translateY(0)",
      background:"#fff", borderRadius:10,
      border:"1px solid " + proj.color + "33",
      borderTop: above ? "3px solid " + proj.color : undefined,
      borderBottom: !above ? "3px solid " + proj.color : undefined,
      boxShadow:"0 8px 30px rgba(0,0,0,0.13)",
      padding:"12px 14px", pointerEvents:"none",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:28, height:28, borderRadius:7, background:proj.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{ev.icon}</div>
        <div>
          <div style={{ fontSize:12, fontWeight:700 }}>{ev.label}</div>
          <div style={{ fontSize:10, color:proj.color, fontWeight:600 }}>{proj.name}</div>
        </div>
      </div>
      <div style={{ fontSize:11, color:T.textMid, lineHeight:1.55, marginBottom:8 }}>{event.notes || EVENT_DESC[event.type]}</div>
      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
        <span style={{ background:proj.chip, border:"1px solid "+proj.color+"25", borderRadius:6, padding:"3px 8px", fontSize:10, color:proj.color, fontWeight:600 }}>Sprint #{event.sprint}</span>
        {sprint && (
          <span style={{ background:T.bg, border:"1px solid "+T.border, borderRadius:6, padding:"3px 8px", fontSize:10, color:T.textMid }}>
            {sprint.start.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} → {sprint.end.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}
          </span>
        )}
      </div>
      {warn && warn.length > 0 && (
        <div style={{ marginTop:8, background:T.warnBg, border:"1px solid "+T.warnBorder, borderRadius:7, padding:"8px 10px" }}>
          <div style={{ fontSize:10, fontWeight:700, color:"#92400E", marginBottom:4 }}>⚠️ Ausências nesta sprint</div>
          {warn.map(function(w) {
            var p = pool.find(function(t){ return t.name === w.name; });
            return (
              <div key={w.name} style={{ fontSize:10, color:"#B45309", display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                <Av person={p || { name:w.name, initials:w.name[0], color:"#888" }} size={14} />
                <span><strong>{w.name}</strong> · {w.dates.length} dia{w.dates.length > 1 ? "s" : ""}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── EVENT PILL ──────────────────────────────────────────────────────────────
function Pill({ event, onDragStart, onClick, onHover, hasWarning }) {
  var proj  = PROJECTS.find(function(p){ return p.id === event.project; });
  var ev    = EVENT_TYPES[event.type];
  var ref   = useRef(null);
  var timer = useRef(null);
  function enter() {
    timer.current = setTimeout(function() {
      if (ref.current) onHover(event, ref.current.getBoundingClientRect());
    }, 300);
  }
  function leave() { clearTimeout(timer.current); onHover(null, null); }
  return (
    <div
      ref={ref} draggable
      onDragStart={function(e){ leave(); onDragStart(e, event); }}
      onClick={function(e){ e.stopPropagation(); onClick(event); }}
      onMouseEnter={enter} onMouseLeave={leave}
      style={{
        display:"flex", alignItems:"center", gap:4,
        background: hasWarning ? T.warnBg : proj.chip,
        border:"1px solid " + (hasWarning ? T.warnBorder : proj.color + "30"),
        borderLeft:"3px solid " + (hasWarning ? T.warn : proj.color),
        borderRadius:5, padding:"3px 6px",
        cursor:"grab", marginBottom:2, userSelect:"none",
      }}
      onMouseDown={function(e){ e.currentTarget.style.boxShadow = "0 2px 8px " + proj.color + "35"; }}
      onMouseUp={function(e){ e.currentTarget.style.boxShadow = "none"; }}
    >
      <span style={{ fontSize:9 }}>{ev.icon}</span>
      <span style={{ fontSize:9, color: hasWarning ? "#92400E" : proj.color, fontWeight:700 }}>{proj.short}</span>
      <span style={{ fontSize:9, color:T.textMid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:60 }}>{ev.label}</span>
      {hasWarning && <span style={{ fontSize:9, marginLeft:"auto" }}>⚠️</span>}
    </div>
  );
}

// ─── EDIT EVENT MODAL ─────────────────────────────────────────────────────────
function EditModal({ event, onSave, onDelete, onClose }) {
  var [type,    setType]    = useState(event.type);
  var [project, setProject] = useState(event.project);
  var [dateStr, setDateStr] = useState(toInput(event.date));
  var [sprint,  setSprint]  = useState(event.sprint);
  var [notes,   setNotes]   = useState(event.notes || "");
  var [dirty,   setDirty]   = useState(false);

  useEffect(function() {
    var h = function(e){ if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return function(){ window.removeEventListener("keydown", h); };
  }, []);

  var proj    = PROJECTS.find(function(p){ return p.id === project; });
  var spList  = PROJ_SP[project] || SPRINTS_A;

  function save() {
    var parts = dateStr.split("-").map(Number);
    onSave(Object.assign({}, event, {
      type: type, project: project, sprint: Number(sprint),
      date: new Date(parts[0], parts[1] - 1, parts[2]), notes: notes,
    }));
    onClose();
  }

  function fc(e){ e.target.style.borderColor = proj.color; }
  function bc(e){ e.target.style.borderColor = T.border; }

  var sprintInfo = spList[sprint - 1];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.28)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }}>
      <div onClick={function(e){ e.stopPropagation(); }} style={{ background:"#fff", borderRadius:16, width:440, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.16)", border:"1px solid "+T.border }}>

        <div style={{ background:proj.light, borderBottom:"1px solid "+proj.color+"20", borderRadius:"16px 16px 0 0", padding:"18px 22px 16px", borderTop:"4px solid "+proj.color, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:proj.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{EVENT_TYPES[type].icon}</div>
            <div>
              <div style={{ fontSize:15, fontWeight:700 }}>{EVENT_TYPES[type].label}</div>
              <div style={{ fontSize:11, color:T.textMid, marginTop:1 }}>{proj.name}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            {dirty && <span style={{ fontSize:10, background:"#FEFCE8", border:"1px solid #FDE047", borderRadius:6, padding:"2px 8px", color:T.textMid }}>não salvo</span>}
            <button onClick={onClose} style={{ background:"#fff", border:"1px solid "+T.border, borderRadius:8, color:T.textMid, cursor:"pointer", fontSize:16, width:30, height:30 }}>×</button>
          </div>
        </div>

        <div style={{ padding:"20px 22px 18px" }}>
          <Field label="Tipo">
            <div style={{ position:"relative" }}>
              <select value={type} onChange={function(e){ setType(e.target.value); setDirty(true); }} style={Object.assign({}, IS, { paddingLeft:32, cursor:"pointer" })} onFocus={fc} onBlur={bc}>
                {Object.entries(EVENT_TYPES).map(function(entry){
                  return <option key={entry[0]} value={entry[0]}>{entry[1].icon} {entry[1].label}</option>;
                })}
              </select>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:14, pointerEvents:"none" }}>{EVENT_TYPES[type].icon}</span>
            </div>
          </Field>

          <Field label="Projeto">
            <select value={project} onChange={function(e){ setProject(e.target.value); setDirty(true); }} style={Object.assign({}, IS, { borderColor:proj.color+"66", color:proj.color, fontWeight:600, cursor:"pointer" })} onFocus={fc} onBlur={function(e){ e.target.style.borderColor = proj.color + "66"; }}>
              {PROJECTS.map(function(p){ return <option key={p.id} value={p.id}>{p.name}</option>; })}
            </select>
          </Field>

          <Field label="Data">
            <input type="date" value={dateStr} min="2026-01-01" max="2026-12-31" onChange={function(e){ setDateStr(e.target.value); setDirty(true); }} style={IS} onFocus={fc} onBlur={bc} />
          </Field>

          <Field label="Sprint">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <input type="range" min={1} max={spList.length} value={sprint} onChange={function(e){ setSprint(Number(e.target.value)); setDirty(true); }} style={{ flex:1, accentColor:proj.color }} />
              <div style={{ minWidth:42, textAlign:"center", background:proj.chip, border:"1px solid "+proj.color+"30", borderRadius:8, padding:"6px 10px", fontSize:13, fontWeight:700, color:proj.color }}>#{sprint}</div>
            </div>
            {sprintInfo && (
              <div style={{ fontSize:11, color:T.textMid, marginTop:4 }}>
                {sprintInfo.start.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} → {sprintInfo.end.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}
              </div>
            )}
          </Field>

          <Field label="Notas">
            <textarea value={notes} onChange={function(e){ setNotes(e.target.value); setDirty(true); }} placeholder="Notas..." rows={3} style={Object.assign({}, IS, { resize:"vertical", lineHeight:1.5 })} onFocus={fc} onBlur={bc} />
          </Field>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
            <button onClick={function(){ onDelete(event.id); }} style={{ background:"none", border:"1px solid #FCA5A5", borderRadius:8, color:"#EF4444", fontSize:12, fontWeight:600, padding:"8px 14px", cursor:"pointer" }}
              onMouseEnter={function(e){ e.currentTarget.style.background = "#FEF2F2"; }}
              onMouseLeave={function(e){ e.currentTarget.style.background = "none"; }}>🗑 Excluir</button>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onClose} style={{ background:T.bg, border:"1px solid "+T.border, borderRadius:8, color:T.textMid, fontSize:12, fontWeight:600, padding:"8px 16px", cursor:"pointer" }}>Cancelar</button>
              <button onClick={save} style={{ background:proj.color, border:"none", borderRadius:8, color:"#fff", fontSize:12, fontWeight:700, padding:"8px 20px", cursor:"pointer" }}>Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MINI YEAR CAL ────────────────────────────────────────────────────────────
function MiniYearCal({ markedDays, markedDays2, onDayDown, onDayEnter, onDayClick, getStyle }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
      {Array.from({ length: 12 }, function(_, month) {
        var tot = daysIn(YEAR, month);
        var off = firstDow(YEAR, month);
        var cells = Array(off).fill(null).concat(Array.from({ length: tot }, function(_, i){ return i + 1; }));
        var mMark1 = Object.keys(markedDays || {}).filter(function(dk){ return Number(dk.split("-")[1]) - 1 === month && markedDays[dk]; }).length;
        var mMark2 = markedDays2 ? markedDays2.filter(function(dk){ return Number(dk.split("-")[1]) - 1 === month; }).length : 0;
        return (
          <div key={month} style={{ background:"#fff", border:"1px solid "+T.border, borderRadius:8, padding:"8px 6px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <span style={{ fontSize:10, fontWeight:700 }}>{MONTHS_SH[month]}</span>
              <div style={{ display:"flex", gap:3 }}>
                {mMark1 > 0 && <span style={{ fontSize:7, background:T.holidayBg, color:T.holiday, borderRadius:8, padding:"1px 4px", fontWeight:700 }}>{mMark1}</span>}
                {mMark2 > 0 && <span style={{ fontSize:7, background:T.warnBg, color:"#B91C1C", borderRadius:8, padding:"1px 4px", fontWeight:700 }}>{mMark2}</span>}
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1, marginBottom:2 }}>
              {WD_SH.map(function(w, i){
                return <div key={i} style={{ textAlign:"center", fontSize:6, color:(i===0||i===6)?"#C4C9D4":T.textLight, fontWeight:600 }}>{w}</div>;
              })}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1 }}>
              {cells.map(function(day, ci) {
                if (!day) return <div key={"e"+ci} />;
                var d   = new Date(YEAR, month, day);
                var isWE = d.getDay() === 0 || d.getDay() === 6;
                var dk   = toDK(d);
                var isTd = sameDay(d, new Date());
                var st   = getStyle(dk, isWE, isTd, d);
                return (
                  <div key={day}
                    onMouseDown={function(e){ if (!isWE && onDayDown) { e.preventDefault(); onDayDown(dk); } }}
                    onMouseEnter={function(){ if (!isWE && onDayEnter) onDayEnter(dk); }}
                    onClick={function(){ if (!isWE && onDayClick) onDayClick(dk); }}
                    style={Object.assign({ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:3, fontSize:7, fontWeight:isTd?700:400, cursor:isWE?"default":"pointer", userSelect:"none" }, st)}
                  >{st.content !== undefined ? st.content : day}</div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PEOPLE DRAWER
// ═══════════════════════════════════════════════════════════════════════════════
function PeopleDrawer({ open, pool, absences, holidays, teams, onUpdatePool, onUpdateAbsences, onUpdateHolidays, onClose }) {
  var [tab,      setTab]      = useState("people");
  var [view,     setView]     = useState("list");
  var [person,   setPerson]   = useState(null);
  var [draft,    setDraft]    = useState(null);
  var [editId,   setEditId]   = useState(null);
  var [staged,   setStaged]   = useState(null);
  var [absDirty, setAbsDirty] = useState(false);
  var [hlStaged, setHlStaged] = useState(null);
  var [hlDirty,  setHlDirty]  = useState(false);
  var [capSprint,setCapSprint]= useState(null);
  var nextId = useRef(Math.max.apply(null, pool.map(function(p){ return p.id; }).concat([0])) + 1);
  var dragging = useRef(false);
  var dragMode = useRef(null);
  var dragSeen = useRef(new Set());

  useEffect(function() {
    if (!open) {
      setTab("people"); setView("list"); setPerson(null);
      setDraft(null); setEditId(null); setStaged(null);
      setAbsDirty(false); setHlStaged(null); setHlDirty(false);
    }
  }, [open]);

  useEffect(function() {
    var stop = function(){ dragging.current = false; dragSeen.current = new Set(); };
    window.addEventListener("mouseup", stop);
    return function(){ window.removeEventListener("mouseup", stop); };
  }, []);

  // people
  function openNew() {
    var d = { id: nextId.current++, name:"", initials:"", color: PALETTE[pool.length % PALETTE.length], area: AREAS[0], level: LEVELS[2], title:"", pointsPerDay:6 };
    setDraft(d); setEditId("new"); setView("edit");
  }
  function openEdit(p) { setDraft(Object.assign({}, p)); setEditId(p.id); setView("edit"); }
  function cancelEdit() { setDraft(null); setEditId(null); setView("list"); }
  function saveDraft() {
    if (!draft.name.trim()) return;
    var final = Object.assign({}, draft, { initials: draft.initials || autoInit(draft.name) });
    onUpdatePool(editId === "new" ? pool.concat([final]) : pool.map(function(p){ return p.id === editId ? final : p; }));
    cancelEdit();
  }
  function removePerson(id) {
    onUpdatePool(pool.filter(function(p){ return p.id !== id; }));
    if (editId === id) cancelEdit();
  }

  // absences
  function openAbsences(p) { setPerson(p); setStaged(new Set(absences[p.name] || [])); setAbsDirty(false); setView("absences"); }
  function toggleDay(dk) {
    setStaged(function(prev) {
      var n = new Set(prev);
      if (n.has(dk)) n.delete(dk); else n.add(dk);
      setAbsDirty(true); return n;
    });
  }
  function startAbsDrag(dk) {
    var isAbs = staged ? staged.has(dk) : (absences[person ? person.name : ""] || []).indexOf(dk) !== -1;
    dragMode.current = isAbs ? "remove" : "add";
    dragging.current = true; dragSeen.current = new Set([dk]);
    setStaged(function(prev) {
      var n = new Set(prev);
      if (dragMode.current === "add") n.add(dk); else n.delete(dk);
      setAbsDirty(true); return n;
    });
  }
  function enterAbsDay(dk) {
    if (!dragging.current || dragSeen.current.has(dk)) return;
    dragSeen.current.add(dk);
    setStaged(function(prev) {
      var n = new Set(prev);
      if (dragMode.current === "add") n.add(dk); else n.delete(dk);
      setAbsDirty(true); return n;
    });
  }
  function saveAbsences() { if (person && staged) onUpdateAbsences(person.name, Array.from(staged)); setAbsDirty(false); }
  function discardAbsences() { if (person) setStaged(new Set(absences[person.name] || [])); setAbsDirty(false); }

  // holidays
  function initHl() { setHlStaged(Object.assign({}, holidays)); setHlDirty(false); }
  function cycleHoliday(dk) {
    setHlStaged(function(prev) {
      var cur = prev[dk]; var n = Object.assign({}, prev);
      if (!cur) n[dk] = "holiday";
      else if (cur === "holiday") n[dk] = "short_friday";
      else delete n[dk];
      setHlDirty(true); return n;
    });
  }
  function saveHolidays() { onUpdateHolidays(hlStaged || holidays); setHlDirty(false); }
  function discardHolidays() { setHlStaged(Object.assign({}, holidays)); setHlDirty(false); }

  var curHl = tab === "holidays" ? (hlStaged || holidays) : holidays;
  var W = 420;
  if (!open) return null;

  var tabs = [
    { id:"people",   label:"👥 Pessoas"    },
    { id:"holidays", label:"🗓 Feriados"   },
    { id:"capacity", label:"⚡ Capacidade" },
  ];

  // ── list ──
  function ListView() {
    return (
      <div style={{ flex:1, overflowY:"auto", paddingBottom:16 }}>
        {AREAS.filter(function(a){ return pool.some(function(p){ return p.area === a; }); }).map(function(area) {
          return (
            <div key={area} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6, padding:"0 14px" }}>
                <div style={{ width:7, height:7, borderRadius:"50%", background:AREA_CLR[area]||"#888" }} />
                <span style={{ fontSize:9, fontWeight:700, color:AREA_CLR[area]||T.textMid, letterSpacing:0.8, textTransform:"uppercase" }}>{area}</span>
                <div style={{ flex:1, height:1, background:T.border }} />
              </div>
              <div style={{ padding:"0 10px", display:"flex", flexDirection:"column", gap:4 }}>
                {pool.filter(function(p){ return p.area === area; }).map(function(p) {
                  var absCount = (absences[p.name] || []).length;
                  return (
                    <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px", background:T.bg, border:"1px solid "+T.border, borderRadius:10 }}>
                      <div style={{ width:36, height:36, borderRadius:9, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700, flexShrink:0 }}>{p.initials}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700 }}>{p.name}</div>
                        <div style={{ fontSize:9, color:T.textMid }}>{p.title} · <span style={{ color:AREA_CLR[p.area]||T.textMid, fontWeight:600 }}>{p.level}</span> · <span style={{ color:T.today, fontWeight:600 }}>{p.pointsPerDay}pts/dia</span></div>
                        {absCount > 0 && <div style={{ fontSize:9, color:T.warn, fontWeight:600, marginTop:1 }}>⚠️ {absCount} ausência{absCount > 1 ? "s" : ""}</div>}
                      </div>
                      <div style={{ display:"flex", gap:3 }}>
                        {[
                          { icon:"📆", title:"Ausências", onClick:function(){ openAbsences(p); } },
                          { icon:"✏️", title:"Editar",    onClick:function(){ openEdit(p); } },
                        ].map(function(btn) {
                          return (
                            <button key={btn.title} onClick={btn.onClick} title={btn.title}
                              style={{ width:26, height:26, borderRadius:6, border:"1px solid "+T.border, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}
                              onMouseEnter={function(e){ e.currentTarget.style.background = p.color+"18"; e.currentTarget.style.borderColor = p.color; }}
                              onMouseLeave={function(e){ e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = T.border; }}>
                              {btn.icon}
                            </button>
                          );
                        })}
                        <button onClick={function(){ removePerson(p.id); }} title="Remover"
                          style={{ width:26, height:26, borderRadius:6, border:"1px solid #FCA5A5", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#EF4444" }}
                          onMouseEnter={function(e){ e.currentTarget.style.background = "#FEF2F2"; }}
                          onMouseLeave={function(e){ e.currentTarget.style.background = "#fff"; }}>×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {pool.length === 0 && <div style={{ textAlign:"center", padding:"40px 16px", color:T.textLight, fontSize:13 }}>Nenhuma pessoa cadastrada.</div>}
      </div>
    );
  }

  // ── edit ──
  function EditView() {
    if (!draft) return null;
    function fc(e){ e.target.style.borderColor = draft.color || T.today; }
    function bc(e){ e.target.style.borderColor = T.border; }
    return (
      <div style={{ flex:1, overflowY:"auto", padding:16 }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ width:60, height:60, borderRadius:14, background:draft.color||"#888", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#fff", fontWeight:700, boxShadow:"0 4px 16px "+(draft.color||"#888")+"55" }}>
            {draft.initials || autoInit(draft.name || "") || "?"}
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:T.textLight, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:6 }}>Cor</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            {PALETTE.map(function(c) {
              return <div key={c} onClick={function(){ setDraft(function(d){ return Object.assign({}, d, { color:c }); }); }}
                style={{ width:22, height:22, borderRadius:5, background:c, cursor:"pointer", border:draft.color===c?"2px solid "+T.text:"2px solid transparent", transform:draft.color===c?"scale(1.15)":"scale(1)", transition:"transform 0.1s" }} />;
            })}
          </div>
        </div>

        <Field label="Nome *">
          <input value={draft.name||""} onChange={function(e){ var n=e.target.value; setDraft(function(d){ return Object.assign({}, d, { name:n, initials:d.initials||autoInit(n) }); }); }} placeholder="Nome completo" style={IS} onFocus={fc} onBlur={bc} />
        </Field>
        <Field label="Iniciais">
          <input value={draft.initials||""} maxLength={2} onChange={function(e){ setDraft(function(d){ return Object.assign({}, d, { initials:e.target.value.toUpperCase() }); }); }} placeholder="AN" style={Object.assign({}, IS, { textTransform:"uppercase", letterSpacing:2, fontWeight:700 })} onFocus={fc} onBlur={bc} />
        </Field>
        <Field label="Cargo">
          <input value={draft.title||""} onChange={function(e){ setDraft(function(d){ return Object.assign({}, d, { title:e.target.value }); }); }} placeholder="Dev Unity" style={IS} onFocus={fc} onBlur={bc} />
        </Field>
        <Field label="Área">
          <select value={draft.area||AREAS[0]} onChange={function(e){ setDraft(function(d){ return Object.assign({}, d, { area:e.target.value }); }); }} style={Object.assign({}, IS, { cursor:"pointer" })} onFocus={fc} onBlur={bc}>
            {AREAS.map(function(a){ return <option key={a} value={a}>{a}</option>; })}
          </select>
        </Field>

        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:T.textLight, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:6 }}>Nível</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:4 }}>
            {LEVELS.map(function(l) {
              var active = draft.level === l;
              return <div key={l} onClick={function(){ setDraft(function(d){ return Object.assign({}, d, { level:l }); }); }}
                style={{ textAlign:"center", padding:"5px 2px", borderRadius:7, border:"1.5px solid "+(active?(draft.color||T.today):T.border), background:active?(draft.color||T.today)+"18":"#fff", cursor:"pointer", fontSize:9, fontWeight:active?700:500, color:active?(draft.color||T.today):T.textMid, transition:"all 0.12s" }}>{l}</div>;
            })}
          </div>
        </div>

        <Field label="Story Points por Dia">
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <input type="range" min={1} max={16} value={draft.pointsPerDay||6}
              onChange={function(e){ setDraft(function(d){ return Object.assign({}, d, { pointsPerDay:Number(e.target.value) }); }); }}
              style={{ flex:1, accentColor:draft.color||T.today }} />
            <div style={{ minWidth:40, textAlign:"center", background:(draft.color||T.today)+"18", border:"1px solid "+(draft.color||T.today)+"30", borderRadius:8, padding:"5px 8px", fontSize:13, fontWeight:700, color:draft.color||T.today }}>{draft.pointsPerDay||6}</div>
          </div>
          <div style={{ fontSize:10, color:T.textMid, marginTop:4 }}>~{(draft.pointsPerDay||6)*10}pts base por sprint (10 dias úteis)</div>
        </Field>

        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          <button onClick={cancelEdit} style={{ flex:1, background:"#fff", border:"1px solid "+T.border, borderRadius:8, padding:"9px", fontSize:12, color:T.textMid, cursor:"pointer", fontWeight:600 }}>Cancelar</button>
          <button onClick={saveDraft} disabled={!draft.name.trim()} style={{ flex:2, background:draft.name.trim()?(draft.color||T.today):"#E5E7EB", border:"none", borderRadius:8, padding:"9px", fontSize:12, color:draft.name.trim()?"#fff":T.textLight, cursor:draft.name.trim()?"pointer":"not-allowed", fontWeight:700 }}>
            {editId === "new" ? "Adicionar" : "Salvar"}
          </button>
        </div>
      </div>
    );
  }

  // ── absences ──
  function AbsView() {
    if (!person) return null;
    var personAbs = staged || new Set(absences[person.name] || []);
    var total = personAbs.size;
    function getAbsStyle(dk, isWE, isTd) {
      var isAbs = personAbs.has(dk);
      return {
        background: isWE ? "#E8EAF0" : isAbs ? "#FEE2E2" : "#F9FAFB",
        border: isTd ? "1.5px solid "+T.today : isAbs ? "1px solid #FCA5A5" : "1px solid #F0F0F0",
        color: isWE ? "#C4C9D4" : isAbs ? "#B91C1C" : T.text,
      };
    }
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"10px 14px 8px", background:person.color+"10", borderBottom:"1px solid "+T.border, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:9, background:person.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:700 }}>{person.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700 }}>{person.name}</div>
              <div style={{ fontSize:10, color:T.textMid }}>{person.title}</div>
            </div>
            {total > 0 && <span style={{ fontSize:10, background:T.warnBg, border:"1px solid "+T.warnBorder, borderRadius:8, padding:"2px 7px", color:"#92400E", fontWeight:600 }}>⚠️ {total}d</span>}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:7 }}>
            <div style={{ display:"flex", gap:6 }}>
              {[{c:"#FEE2E2",b:"#FCA5A5",l:"Ausente"},{c:"#fff",b:T.border,l:"Disponível"},{c:"#E8EAF0",b:T.border,l:"Fim de semana"}].map(function(x) {
                return <div key={x.l} style={{ display:"flex", alignItems:"center", gap:3 }}><div style={{ width:10, height:10, borderRadius:2, background:x.c, border:"1px solid "+x.b }} /><span style={{ fontSize:8, color:T.textMid }}>{x.l}</span></div>;
              })}
            </div>
            <button onClick={function(){ setStaged(new Set()); setAbsDirty(true); }} style={{ fontSize:9, background:"none", border:"1px solid #FCA5A5", borderRadius:6, color:"#EF4444", padding:"2px 8px", cursor:"pointer", fontWeight:600 }}>Limpar</button>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 0" }}>
          <MiniYearCal
            markedDays2={Array.from(personAbs)}
            onDayDown={startAbsDrag}
            onDayEnter={enterAbsDay}
            onDayClick={toggleDay}
            getStyle={function(dk, isWE, isTd) { return getAbsStyle(dk, isWE, isTd); }}
          />
        </div>

        <div style={{ padding:"10px 12px", borderTop:"1px solid "+T.border, background:"#fff", flexShrink:0, display:"flex", gap:8 }}>
          <button onClick={discardAbsences} disabled={!absDirty} style={{ flex:1, background:T.bg, border:"1px solid "+T.border, borderRadius:8, padding:"8px", fontSize:11, color:absDirty?T.textMid:T.textLight, cursor:absDirty?"pointer":"not-allowed", fontWeight:600 }}>Descartar</button>
          <button onClick={saveAbsences} disabled={!absDirty} style={{ flex:2, background:absDirty?person.color:"#E5E7EB", border:"none", borderRadius:8, padding:"8px", fontSize:11, color:absDirty?"#fff":T.textLight, cursor:absDirty?"pointer":"not-allowed", fontWeight:700 }}>
            {absDirty ? "✓ Salvar Ausências" : "Sem alterações"}
          </button>
        </div>
      </div>
    );
  }

  // ── holidays ──
  function HolidaysView() {
    var cur = hlStaged || holidays;
    var totalH  = Object.values(cur).filter(function(v){ return v === "holiday"; }).length;
    var totalSF = Object.values(cur).filter(function(v){ return v === "short_friday"; }).length;
    function getHlStyle(dk, isWE, isTd, d) {
      var ht = cur[dk];
      var isFri = d.getDay() === 5;
      var bg = "#F9FAFB", border = "1px solid #F0F0F0", color = T.text, content = undefined;
      if (isWE) { bg = "#E8EAF0"; color = "#C4C9D4"; }
      else if (ht === "holiday")     { bg = T.holidayBg;  border = "1px solid "+T.holidayBorder;  color = T.holiday;  content = "🎉"; }
      else if (ht === "short_friday"){ bg = T.shortFriBg; border = "1px solid "+T.shortFriBorder; color = T.shortFri; content = "🕐"; }
      else if (isFri) { bg = T.shortFriBg+"44"; }
      if (isTd) border = "1.5px solid "+T.today;
      return { background:bg, border:border, color:color, content:content };
    }
    return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"10px 14px 8px", background:T.bg, borderBottom:"1px solid "+T.border, flexShrink:0 }}>
          <div style={{ fontSize:11, color:T.textMid, marginBottom:8 }}>Clique para ciclar: <strong style={{color:T.holiday}}>🎉 Feriado</strong> → <strong style={{color:T.shortFri}}>🕐 Short Friday</strong> → vazio</div>
          <div style={{ display:"flex", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:T.holiday, background:T.holidayBg, border:"1px solid "+T.holidayBorder, borderRadius:8, padding:"4px 10px" }}>🎉 Feriados: {totalH}</span>
            <span style={{ fontSize:11, fontWeight:600, color:T.shortFri, background:T.shortFriBg, border:"1px solid "+T.shortFriBorder, borderRadius:8, padding:"4px 10px" }}>🕐 Short Fridays: {totalSF}</span>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:"10px 10px 0" }}>
          <MiniYearCal
            markedDays={cur}
            onDayClick={cycleHoliday}
            getStyle={getHlStyle}
          />
        </div>
        <div style={{ padding:"10px 12px", borderTop:"1px solid "+T.border, background:"#fff", flexShrink:0, display:"flex", gap:8 }}>
          <button onClick={discardHolidays} disabled={!hlDirty} style={{ flex:1, background:T.bg, border:"1px solid "+T.border, borderRadius:8, padding:"8px", fontSize:11, color:hlDirty?T.textMid:T.textLight, cursor:hlDirty?"pointer":"not-allowed", fontWeight:600 }}>Descartar</button>
          <button onClick={saveHolidays} disabled={!hlDirty} style={{ flex:2, background:hlDirty?"#7B68EE":"#E5E7EB", border:"none", borderRadius:8, padding:"8px", fontSize:11, color:hlDirty?"#fff":T.textLight, cursor:hlDirty?"pointer":"not-allowed", fontWeight:700 }}>
            {hlDirty ? "✓ Salvar Feriados" : "Sem alterações"}
          </button>
        </div>
      </div>
    );
  }

  // ── capacity ──
  function CapacityView() {
    var allSprints = SPRINTS_A.map(function(s){ return Object.assign({}, s, { group:"A", label:"S"+s.num+" IZA+HITS" }); })
      .concat(SPRINTS_B.map(function(s){ return Object.assign({}, s, { group:"B", label:"S"+s.num+" GAUCHO+SCAT" }); }))
      .sort(function(a, b){ return a.start - b.start; });
    var now = new Date();
    var upcoming = allSprints.filter(function(s){ return s.end >= now; }).slice(0, 12);
    var sel = capSprint || upcoming[0];
    if (!sel) return <div style={{ padding:20, color:T.textMid, fontSize:12 }}>Sem sprints disponíveis.</div>;

    var projIds = sel.group === "A" ? ["iza","izyhits"] : ["gaucho","supermarcat"];
    var involvedNames = new Set(projIds.reduce(function(acc, pid){ return acc.concat((teams[pid]||[]).map(function(m){ return m.name; })); }, []));
    var involved = pool.filter(function(p){ return involvedNames.has(p.name); });
    var caps = involved.map(function(p){ var c = calcCapacity(p, sel, absences, holidays); return Object.assign({ person:p }, c); });
    var totalBase = caps.reduce(function(s, c){ return s + c.base; }, 0);
    var totalLost = caps.reduce(function(s, c){ return s + c.lost; }, 0);
    var maxPoss   = caps.reduce(function(s, c){ return s + c.base + c.lost; }, 0);
    var spDates   = dateRange(sel.start, sel.end);
    var hlInSprint = spDates.filter(function(dk){ return holidays[dk]; });
    var workDays  = spDates.filter(function(dk){ return isWorkday(new Date(dk+"T12:00")) && !holidays[dk]; }).length;

    return (
      <div style={{ flex:1, overflowY:"auto", padding:"12px 14px" }}>
        <div style={{ marginBottom:14 }}>
          <STitle>Selecionar Sprint</STitle>
          <select value={sel.group+"-"+sel.num} onChange={function(e){ var p=e.target.value.split("-"); setCapSprint(allSprints.find(function(s){ return s.group===p[0]&&s.num===Number(p[1]); })); }} style={Object.assign({}, IS, { cursor:"pointer", fontSize:11 })}>
            {upcoming.map(function(s){ return <option key={s.group+"-"+s.num} value={s.group+"-"+s.num}>{s.label} · {s.start.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} → {s.end.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</option>; })}
          </select>
        </div>

        <div style={{ background:T.bg, border:"1px solid "+T.border, borderRadius:10, padding:"12px 14px", marginBottom:14 }}>
          <div style={{ fontSize:11, fontWeight:700, marginBottom:10 }}>Capacidade Total</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10 }}>
            {[
              { l:"DISPONÍVEL",  v:totalBase+"pts",  c:T.today    },
              { l:"PERDIDOS",    v:totalLost+"pts",  c:"#EF4444"  },
              { l:"DIAS ÚTEIS",  v:workDays+"d",     c:"#22C55E"  },
            ].map(function(x) {
              return <div key={x.l} style={{ textAlign:"center", background:"#fff", border:"1px solid "+T.border, borderRadius:8, padding:"8px 4px" }}><div style={{ fontSize:9, color:T.textLight, fontWeight:600, letterSpacing:0.8, marginBottom:2 }}>{x.l}</div><div style={{ fontSize:16, fontWeight:800, color:x.c }}>{x.v}</div></div>;
            })}
          </div>
          <CapBar total={totalBase} lost={totalLost} max={maxPoss} color={T.today} />
        </div>

        <STitle>Por Pessoa</STitle>
        {caps.length === 0 && <div style={{ fontSize:11, color:T.textMid, marginBottom:14 }}>Nenhuma pessoa alocada.</div>}
        {caps.map(function(c) {
          var p = c.person;
          var absInSprint = (absences[p.name]||[]).filter(function(dk){ return new Set(spDates).has(dk); }).length;
          return (
            <div key={p.name} style={{ background:"#fff", border:"1px solid "+T.border, borderRadius:10, padding:"10px 12px", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff", fontWeight:700, flexShrink:0 }}>{p.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700 }}>{p.name}</div>
                  <div style={{ fontSize:9, color:T.textMid }}>{p.pointsPerDay}pts/dia</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:14, fontWeight:800, color:c.lost>0?"#EF4444":p.color }}>{c.base}pts</div>
                  {c.lost > 0 && <div style={{ fontSize:9, color:"#EF4444", fontWeight:600 }}>-{c.lost}pts</div>}
                </div>
              </div>
              <CapBar total={c.base} lost={c.lost} max={c.base+c.lost} color={p.color} />
              {c.lost > 0 && (
                <div style={{ marginTop:6, fontSize:9, color:"#B45309", background:T.warnBg, border:"1px solid "+T.warnBorder, borderRadius:6, padding:"4px 8px" }}>
                  ⚠️ {absInSprint} ausência{absInSprint!==1?"s":""} + feriados nesta sprint
                </div>
              )}
            </div>
          );
        })}

        {hlInSprint.length > 0 && (
          <div style={{ marginTop:4 }}>
            <STitle>Feriados / Short Fridays</STitle>
            {hlInSprint.map(function(dk) {
              var ht = holidays[dk];
              return (
                <div key={dk} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:ht==="holiday"?T.holidayBg:T.shortFriBg, border:"1px solid "+(ht==="holiday"?T.holidayBorder:T.shortFriBorder), borderRadius:8, marginBottom:4 }}>
                  <span style={{ fontSize:14 }}>{ht==="holiday"?"🎉":"🕐"}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:ht==="holiday"?T.holiday:T.shortFri }}>{ht==="holiday"?"Feriado":"Short Friday"}</div>
                    <div style={{ fontSize:10, color:T.textMid }}>{new Date(dk+"T12:00").toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"})}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── render drawer ──
  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:200 }} />
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:W, zIndex:201, background:"#fff", borderLeft:"1px solid "+T.border, boxShadow:"-8px 0 40px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }}>

        {/* Header */}
        <div style={{ padding:"12px 14px 0", borderBottom:"1px solid "+T.border, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7 }}>
              {(view !== "list" && tab === "people") && (
                <button onClick={function(){ setView("list"); setPerson(null); setDraft(null); setEditId(null); }}
                  style={{ width:26, height:26, borderRadius:6, border:"1px solid "+T.border, background:T.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:T.textMid }}>←</button>
              )}
              <div style={{ fontSize:14, fontWeight:700 }}>
                {tab==="people" && view==="list"     && "👥 Pessoas"}
                {tab==="people" && view==="edit"     && (editId==="new" ? "✨ Nova Pessoa" : "✏️ Editar")}
                {tab==="people" && view==="absences" && ("📆 " + (person ? person.name : ""))}
                {tab==="holidays"  && "🗓 Feriados & Short Fridays"}
                {tab==="capacity"  && "⚡ Capacidade por Sprint"}
              </div>
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {tab==="people" && view==="list" && (
                <button onClick={openNew} style={{ background:T.today, border:"none", borderRadius:7, color:"#fff", fontSize:11, fontWeight:700, padding:"5px 10px", cursor:"pointer" }}>+ Pessoa</button>
              )}
              <button onClick={onClose}
                style={{ width:28, height:28, borderRadius:7, border:"1px solid "+T.border, background:T.bg, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, color:T.textMid }}
                onMouseEnter={function(e){ e.currentTarget.style.background="#FEF2F2"; e.currentTarget.style.borderColor="#FCA5A5"; e.currentTarget.style.color="#EF4444"; }}
                onMouseLeave={function(e){ e.currentTarget.style.background=T.bg; e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.textMid; }}>×</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:"flex", gap:2 }}>
            {tabs.map(function(t) {
              var active = tab === t.id;
              return (
                <button key={t.id}
                  onClick={function(){ setTab(t.id); setView("list"); if(t.id==="holidays") initHl(); }}
                  style={{ flex:1, background:"none", border:"none", borderBottom:"2.5px solid "+(active?T.today:"transparent"), padding:"7px 4px", fontSize:10, fontWeight:active?700:500, color:active?T.today:T.textMid, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {tab==="people"   && view==="list"     && <ListView />}
        {tab==="people"   && view==="edit"     && <EditView />}
        {tab==="people"   && view==="absences" && <AbsView />}
        {tab==="holidays" && <HolidaysView />}
        {tab==="capacity" && <CapacityView />}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudioCalendar() {
  var today = new Date();
  var initMonth = today.getFullYear() === YEAR ? today.getMonth() : 2;

  var [viewMonth,   setViewMonth]   = useState(initMonth);
  var [events,      setEvents]      = useState(buildEvents);
  var [selected,    setSelected]    = useState(null);
  var [filterProj,  setFilterProj]  = useState(PROJECTS.map(function(p){ return p.id; }));
  var [filterTypes, setFilterTypes] = useState(Object.keys(EVENT_TYPES));
  var [dragOver,    setDragOver]    = useState(null);
  var [tooltip,     setTooltip]     = useState({ event:null, rect:null });
  var [pool,        setPool]        = useState(INIT_POOL);
  var [teams,       setTeams]       = useState(INIT_TEAMS);
  var [absences,    setAbsences]    = useState({});
  var [holidays,    setHolidays]    = useState(INIT_HOLIDAYS);
  var [expandProj,  setExpandProj]  = useState(null);
  var [addingTo,    setAddingTo]    = useState(null);
  var [addName,     setAddName]     = useState("");
  var [drawerOpen,  setDrawerOpen]  = useState(false);
  var dragEvRef = useRef(null);
  var ghostRef  = useRef(null);

  var warnings = useMemo(function(){ return computeWarnings(teams, absences); }, [teams, absences]);

  function handleDragStart(e, event) {
    e.dataTransfer.effectAllowed = "move";
    var blank = document.createElement("div"); blank.style.cssText="position:fixed;top:-9999px;width:1px;height:1px";
    document.body.appendChild(blank); e.dataTransfer.setDragImage(blank,0,0);
    requestAnimationFrame(function(){ document.body.removeChild(blank); });
    dragEvRef.current = event;
    var proj = PROJECTS.find(function(p){ return p.id === event.project; });
    ghostRef.current = spawnGhost(EVENT_TYPES[event.type].icon+" "+proj.short+" · "+EVENT_TYPES[event.type].label, proj.color);
  }

  function handleDrop(e, day) {
    e.preventDefault();
    var ev = dragEvRef.current; if (!ev) return;
    setEvents(function(prev){ return prev.map(function(x){ return x.id===ev.id ? Object.assign({},x,{date:new Date(YEAR,viewMonth,day)}) : x; }); });
    setDragOver(null);
    var g = ghostRef.current;
    if (g) { g.style.opacity="0"; setTimeout(function(){ if(g.parentNode)g.parentNode.removeChild(g); },120); ghostRef.current=null; }
  }

  useEffect(function() {
    var onMove = function(e){ var g=ghostRef.current; if(g){g.style.left=(e.clientX+16)+"px";g.style.top=(e.clientY+8)+"px";} };
    var onEnd  = function(){ var g=ghostRef.current; if(g){g.style.opacity="0";setTimeout(function(){if(g.parentNode)g.parentNode.removeChild(g);},120);ghostRef.current=null;} dragEvRef.current=null; setDragOver(null); };
    window.addEventListener("mousemove",onMove); window.addEventListener("dragend",onEnd);
    return function(){ window.removeEventListener("mousemove",onMove); window.removeEventListener("dragend",onEnd); };
  }, []);

  function eventsOnDay(day) {
    var d = new Date(YEAR, viewMonth, day);
    return events.filter(function(ev){
      return sameDay(ev.date,d) && filterProj.indexOf(ev.project)!==-1 && filterTypes.indexOf(ev.type)!==-1;
    });
  }

  var totalDays = daysIn(YEAR, viewMonth);
  var startOff  = firstDow(YEAR, viewMonth);
  var cells = Array(startOff).fill(null).concat(Array.from({length:totalDays},function(_,i){return i+1;}));
  var weeks = [];
  for (var i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  var monthSprints = [
    { label:"IZA + HITS",    list:SPRINTS_A, color:PROJECTS[0].color },
    { label:"GAUCHO + SCAT", list:SPRINTS_B, color:PROJECTS[1].color },
  ].map(function(g) {
    return Object.assign({}, g, { list: g.list.filter(function(s){ var mS=new Date(YEAR,viewMonth,1),mE=new Date(YEAR,viewMonth+1,0); return s.start<=mE&&s.end>=mS; }) });
  });

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"Inter,sans-serif", color:T.text }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* TOP BAR */}
      <div style={{ background:"#fff", borderBottom:"1px solid "+T.border, height:52, padding:"0 24px", position:"sticky", top:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#7B68EE,#F97316)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff" }}>◈</div>
          <span style={{ fontSize:15, fontWeight:700, letterSpacing:-0.3 }}>Studio Calendar</span>
          <span style={{ background:"#EEF2FF", color:"#7B68EE", borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:600 }}>2026</span>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={function(){ setDrawerOpen(function(o){ return !o; }); }}
            style={{ background:drawerOpen?"#EEF2FF":T.bg, border:"1.5px solid "+(drawerOpen?T.today:T.border), borderRadius:8, padding:"5px 14px", color:drawerOpen?T.today:T.textMid, fontSize:11, fontWeight:600, cursor:"pointer" }}>
            👥 Pessoas {drawerOpen?"›":"‹"}
          </button>
          <div style={{ width:1, height:20, background:T.border }} />
          {PROJECTS.map(function(p) {
            var on = filterProj.indexOf(p.id) !== -1;
            return (
              <button key={p.id}
                onClick={function(){ setFilterProj(function(prev){ return on ? prev.filter(function(x){return x!==p.id;}) : prev.concat([p.id]); }); }}
                style={{ background:on?p.color:T.bg, border:"1.5px solid "+(on?p.color:T.border), borderRadius:20, padding:"4px 12px", color:on?"#fff":T.textMid, fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {p.short}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", minHeight:"calc(100vh - 52px)" }}>

        {/* LEFT SIDEBAR */}
        <div style={{ background:"#fff", borderRight:"1px solid "+T.border, padding:"18px 14px", overflowY:"auto" }}>

          {/* Month nav */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
            <button onClick={function(){ setViewMonth(function(m){return Math.max(0,m-1);}); }} disabled={viewMonth===0}
              style={{ background:"none", border:"1px solid "+T.border, borderRadius:8, color:viewMonth===0?T.border:T.textMid, width:30, height:30, cursor:viewMonth===0?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>‹</button>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{MONTHS_PT[viewMonth]}</div>
              <div style={{ fontSize:10, color:T.textLight }}>2026</div>
            </div>
            <button onClick={function(){ setViewMonth(function(m){return Math.min(11,m+1);}); }} disabled={viewMonth===11}
              style={{ background:"none", border:"1px solid "+T.border, borderRadius:8, color:viewMonth===11?T.border:T.textMid, width:30, height:30, cursor:viewMonth===11?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>›</button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:3, marginBottom:18 }}>
            {MONTHS_PT.map(function(m, i) {
              return <button key={i} onClick={function(){ setViewMonth(i); }}
                style={{ background:viewMonth===i?T.today:"none", border:viewMonth===i?"none":"1px solid "+T.border, borderRadius:6, padding:"5px 2px", fontSize:9, color:viewMonth===i?"#fff":T.textMid, fontWeight:viewMonth===i?700:500, cursor:"pointer" }}>{m.slice(0,3).toUpperCase()}</button>;
            })}
          </div>

          <Divider />
          <STitle>Tipos de Evento</STitle>
          <div style={{ marginBottom:18 }}>
            {Object.entries(EVENT_TYPES).map(function(entry) {
              var key = entry[0]; var ev = entry[1];
              var on = filterTypes.indexOf(key) !== -1;
              return (
                <div key={key} onClick={function(){ setFilterTypes(function(prev){ return on?prev.filter(function(t){return t!==key;}):prev.concat([key]); }); }}
                  style={{ display:"flex", alignItems:"center", gap:7, padding:"5px 7px", borderRadius:6, cursor:"pointer", marginBottom:1, background:on?ev.bg:"transparent", opacity:on?1:0.35 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:ev.color, flexShrink:0 }} />
                  <span style={{ fontSize:10 }}>{ev.icon}</span>
                  <span style={{ fontSize:11, fontWeight:on?500:400 }}>{ev.label}</span>
                </div>
              );
            })}
          </div>

          <Divider />
          <STitle>Sprints do Mês</STitle>
          <div style={{ marginBottom:18 }}>
            {monthSprints.map(function(g) {
              return g.list.map(function(s) {
                var pids = g.label.indexOf("IZA") !== -1 ? ["iza","izyhits"] : ["gaucho","supermarcat"];
                var hasW = pids.some(function(pid){ return warnings[pid] && warnings[pid][s.num] && warnings[pid][s.num].length > 0; });
                var spDates = dateRange(s.start, s.end);
                var hlC  = spDates.filter(function(dk){ return holidays[dk]==="holiday"; }).length;
                var sfC  = spDates.filter(function(dk){ return holidays[dk]==="short_friday"; }).length;
                return (
                  <div key={g.label+"-"+s.num} style={{ background:hasW?T.warnBg:T.bg, borderRadius:8, padding:"8px 10px", marginBottom:5, border:"1px solid "+(hasW?T.warnBorder:T.border), borderLeft:"3px solid "+(hasW?T.warn:g.color) }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:hasW?"#92400E":g.color }}>S{s.num} · {g.label}</div>
                      <div style={{ display:"flex", gap:4 }}>
                        {hlC>0 && <span style={{ fontSize:9, background:T.holidayBg, color:T.holiday, borderRadius:10, padding:"1px 5px", fontWeight:700 }}>🎉{hlC}</span>}
                        {sfC>0 && <span style={{ fontSize:9, background:T.shortFriBg, color:T.shortFri, borderRadius:10, padding:"1px 5px", fontWeight:700 }}>🕐{sfC}</span>}
                        {hasW && <span style={{ fontSize:9 }}>⚠️</span>}
                      </div>
                    </div>
                    <div style={{ fontSize:10, color:T.textMid, marginTop:2 }}>{s.start.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})} → {s.end.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</div>
                  </div>
                );
              });
            })}
          </div>

          {today.getFullYear() === YEAR && (
            <button onClick={function(){ setViewMonth(today.getMonth()); }}
              style={{ width:"100%", background:"linear-gradient(135deg,#7B68EE,#F97316)", border:"none", borderRadius:8, padding:"9px", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", marginBottom:18 }}>↩ Hoje</button>
          )}

          <Divider />
          <STitle>Time por Projeto</STitle>
          {PROJECTS.map(function(proj) {
            var members  = teams[proj.id] || [];
            var isOpen   = expandProj === proj.id;
            var isAdding = addingTo === proj.id;
            var available = pool.filter(function(tm){ return !members.some(function(m){ return m.name===tm.name; }); });
            return (
              <div key={proj.id} style={{ marginBottom:6 }}>
                <div onClick={function(){ setExpandProj(isOpen?null:proj.id); }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:isOpen?"8px 8px 0 0":8, cursor:"pointer", background:isOpen?proj.light:T.bg, border:"1px solid "+(isOpen?proj.color+"44":T.border) }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:proj.color }} />
                    <span style={{ fontSize:11, fontWeight:600 }}>{proj.short}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ display:"flex" }}>
                      {members.slice(0,3).map(function(m, i) {
                        var tm = pool.find(function(t){ return t.name===m.name; });
                        return <div key={m.name} style={{ width:18, height:18, borderRadius:"50%", background:tm?tm.color:"#888", border:"2px solid #fff", marginLeft:i===0?0:-5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:"#fff", fontWeight:700 }}>{tm?tm.initials.slice(0,1):m.name[0]}</div>;
                      })}
                      {members.length>3 && <div style={{ width:18, height:18, borderRadius:"50%", background:"#E5E7EB", border:"2px solid #fff", marginLeft:-5, display:"flex", alignItems:"center", justifyContent:"center", fontSize:7, color:T.textMid, fontWeight:700 }}>+{members.length-3}</div>}
                    </div>
                    <span style={{ fontSize:10, color:T.textLight }}>{isOpen?"▲":"▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ background:"#fff", border:"1px solid "+proj.color+"44", borderTop:"none", borderRadius:"0 0 8px 8px", padding:"10px 10px 8px" }}>
                    {members.length===0 && <div style={{ fontSize:11, color:T.textLight, textAlign:"center", padding:"8px 0" }}>Nenhum membro</div>}
                    {members.map(function(m, i) {
                      var tm = pool.find(function(t){ return t.name===m.name; });
                      return (
                        <div key={m.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:7, marginBottom:3, background:T.bg, border:"1px solid "+T.border }}>
                          <Av person={tm || { name:m.name, initials:m.name[0], color:"#888" }} size={26} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:11, fontWeight:600 }}>{m.name}</div>
                            <div style={{ fontSize:9, color:(tm&&AREA_CLR[tm.area])||proj.color, fontWeight:600 }}>{tm?(tm.title||tm.area):"—"}</div>
                          </div>
                          <button onClick={function(e){ e.stopPropagation(); setTeams(function(prev){ var n=Object.assign({},prev); n[proj.id]=n[proj.id].filter(function(_,j){return j!==i;}); return n; }); }}
                            style={{ background:"none", border:"none", cursor:"pointer", color:"#D1D5DB", fontSize:15 }}
                            onMouseEnter={function(e){ e.currentTarget.style.color="#EF4444"; }}
                            onMouseLeave={function(e){ e.currentTarget.style.color="#D1D5DB"; }}>×</button>
                        </div>
                      );
                    })}
                    {!isAdding ? (
                      <button onClick={function(e){ e.stopPropagation(); setAddingTo(proj.id); setAddName(""); }}
                        style={{ width:"100%", marginTop:4, background:"none", border:"1.5px dashed "+proj.color+"66", borderRadius:7, padding:"7px", cursor:"pointer", color:proj.color, fontSize:11, fontWeight:600 }}
                        onMouseEnter={function(e){ e.currentTarget.style.background=proj.light; }}
                        onMouseLeave={function(e){ e.currentTarget.style.background="none"; }}>+ Adicionar membro</button>
                    ) : (
                      <div style={{ marginTop:6, padding:"10px", background:proj.light, border:"1px solid "+proj.color+"33", borderRadius:8 }}>
                        <select value={addName} onChange={function(e){ setAddName(e.target.value); }}
                          style={{ width:"100%", marginBottom:8, background:"#fff", border:"1.5px solid "+T.border, borderRadius:7, padding:"6px 8px", fontSize:12, color:T.text, outline:"none" }}>
                          <option value="">Selecionar...</option>
                          {available.map(function(tm){ return <option key={tm.name} value={tm.name}>{tm.name} · {tm.title}</option>; })}
                        </select>
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={function(e){ e.stopPropagation(); setAddingTo(null); }} style={{ flex:1, background:"#fff", border:"1px solid "+T.border, borderRadius:7, padding:"6px", fontSize:11, color:T.textMid, cursor:"pointer" }}>Cancelar</button>
                          <button onClick={function(e){ e.stopPropagation(); if(!addName)return; setTeams(function(prev){ var n=Object.assign({},prev); n[proj.id]=(n[proj.id]||[]).concat([{name:addName}]); return n; }); setAddingTo(null); }}
                            style={{ flex:1, background:proj.color, border:"none", borderRadius:7, padding:"6px", fontSize:11, color:"#fff", fontWeight:700, cursor:"pointer" }}>Adicionar</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CALENDAR */}
        <div style={{ padding:"20px 22px", background:T.bg, marginRight:drawerOpen?420:0, transition:"margin-right 0.25s" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 style={{ margin:0, fontSize:18, fontWeight:700 }}>
              {MONTHS_PT[viewMonth]} <span style={{ color:T.textLight, fontWeight:500 }}>2026</span>
            </h2>
            <div style={{ display:"flex", gap:8 }}>
              {[{label:"Grupo A: IZA + HITS",dot:PROJECTS[0].color},{label:"Grupo B: GAUCHO + SCAT",dot:PROJECTS[1].color}].map(function(g) {
                return (
                  <div key={g.label} style={{ display:"flex", alignItems:"center", gap:5, background:"#fff", border:"1px solid "+T.border, borderRadius:20, padding:"4px 10px" }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:g.dot }} />
                    <span style={{ fontSize:10, color:T.textMid, fontWeight:500 }}>{g.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
            {WEEKDAYS.map(function(wd, i) {
              return <div key={wd} style={{ textAlign:"center", fontSize:10, fontWeight:600, padding:"4px 0", color:(i===0||i===6)?"#C4C9D4":wd==="Qua"?"#F97316":T.textLight, letterSpacing:0.5, textTransform:"uppercase", opacity:(i===0||i===6)?0.6:1 }}>{wd}</div>;
            })}
          </div>

          {/* Weeks */}
          {weeks.map(function(week, wi) {
            return (
              <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
                {week.map(function(day, di) {
                  if (!day) return <div key={"e-"+wi+"-"+di} style={{ minHeight:116 }} />;

                  var d        = new Date(YEAR, viewMonth, day);
                  var isToday  = sameDay(d, today);
                  var isWed    = d.getDay() === 3;
                  var isDrop   = dragOver === day;
                  var isWE     = d.getDay() === 0 || d.getDay() === 6;
                  var dayEvs   = eventsOnDay(day);
                  var sHere    = sprintsOnDay(d);
                  var hasA     = sHere.some(function(s){ return s.group==="A"; });
                  var hasB     = sHere.some(function(s){ return s.group==="B"; });
                  var startA   = dayEvs.some(function(e){ return e.type==="sprint_start"&&(e.project==="iza"||e.project==="izyhits"); });
                  var startB   = dayEvs.some(function(e){ return e.type==="sprint_start"&&(e.project==="gaucho"||e.project==="supermarcat"); });
                  var endA     = dayEvs.some(function(e){ return e.type==="sprint_end"&&(e.project==="iza"||e.project==="izyhits"); });
                  var endB     = dayEvs.some(function(e){ return e.type==="sprint_end"&&(e.project==="gaucho"||e.project==="supermarcat"); });
                  var dk       = toDK(d);
                  var absentDay = Object.values(absences).some(function(arr){ return arr.indexOf(dk)!==-1; });
                  var ht       = holidays[dk];
                  var topColor = (hasA||hasB) ? (hasA?PROJECTS[0].color:PROJECTS[1].color) : T.border;

                  var bg = T.surface;
                  if (isDrop) bg = T.dropBg;
                  else if (isToday) bg = T.todayBg;
                  else if (isWE) bg = "#E8EAF0";
                  else if (ht === "holiday") bg = T.holidayBg;
                  else if (ht === "short_friday") bg = T.shortFriBg;
                  else if (absentDay) bg = T.warnBg;

                  var cellBorder = isDrop ? "2px dashed "+T.dropBorder
                    : isToday ? "1.5px solid "+T.today
                    : ht==="holiday" ? "1px solid "+T.holidayBorder
                    : ht==="short_friday" ? "1px solid "+T.shortFriBorder
                    : "1px solid "+(absentDay?T.warnBorder:T.border);

                  var dayNumColor = isToday ? "#fff"
                    : isWE ? "#B0B7C3"
                    : isWed ? "#F97316"
                    : ht==="holiday" ? T.holiday
                    : ht==="short_friday" ? T.shortFri
                    : T.text;

                  return (
                    <div key={day}
                      onDragOver={function(e){ e.preventDefault(); setDragOver(day); }}
                      onDragLeave={function(){ setDragOver(null); }}
                      onDrop={function(e){ handleDrop(e, day); }}
                      style={{ minHeight:116, background:bg, border:cellBorder, borderTop:(!isToday&&!isDrop)?"3px solid "+topColor:undefined, borderRadius:8, padding:"7px 7px 6px", position:"relative", overflow:"hidden", pointerEvents:isWE?"none":"auto" }}>

                      {isWE && <div style={{ position:"absolute", inset:0, borderRadius:8, pointerEvents:"none", background:"repeating-linear-gradient(135deg,transparent,transparent 5px,rgba(0,0,0,0.025) 5px,rgba(0,0,0,0.025) 6px)" }} />}
                      {ht && !isWE && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:ht==="holiday"?T.holiday:T.shortFri, borderRadius:"8px 8px 0 0" }} />}

                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:3 }}>
                          <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", background:isToday?T.today:"transparent", fontSize:11, fontWeight:isToday?700:500, color:dayNumColor }}>{day}</div>
                          {ht==="holiday"     && <span style={{ fontSize:9 }}>🎉</span>}
                          {ht==="short_friday"&& <span style={{ fontSize:9 }}>🕐</span>}
                        </div>
                        <div style={{ display:"flex", gap:2 }}>
                          {absentDay && !isWE && !ht && <span style={{ fontSize:9 }}>⚠️</span>}
                          {hasA && <div style={{ width:5, height:5, borderRadius:"50%", background:PROJECTS[0].color+"50" }} />}
                          {hasB && <div style={{ width:5, height:5, borderRadius:"50%", background:PROJECTS[1].color+"50" }} />}
                        </div>
                      </div>

                      {(startA||endA) && <div style={{ height:2, background:startA?"#22C55E":"#EF4444", borderRadius:2, marginBottom:2, opacity:0.7 }} />}
                      {(startB||endB) && <div style={{ height:2, background:startB?"#22C55E88":"#EF444488", borderRadius:2, marginBottom:2 }} />}

                      {dayEvs.slice(0,5).map(function(ev) {
                        var hasW = !!(warnings[ev.project] && warnings[ev.project][ev.sprint] && warnings[ev.project][ev.sprint].length > 0);
                        return <Pill key={ev.id} event={ev} onDragStart={handleDragStart} onClick={setSelected} onHover={function(ev,rect){ setTooltip({event:ev,rect:rect}); }} hasWarning={hasW} />;
                      })}
                      {dayEvs.length > 5 && <div style={{ fontSize:9, color:T.textLight, paddingLeft:3, marginTop:1 }}>+{dayEvs.length-5} mais</div>}
                      {isDrop && dayEvs.length===0 && <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", fontSize:22, color:T.dropBorder, opacity:0.25 }}>+</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {tooltip.event && tooltip.rect && !selected && !drawerOpen && (
        <Tooltip event={tooltip.event} anchorRect={tooltip.rect} warnings={warnings} pool={pool} />
      )}

      {selected && (
        <EditModal event={selected}
          onSave={function(updated){ setEvents(function(prev){ return prev.map(function(e){ return e.id===updated.id?updated:e; }); }); }}
          onDelete={function(id){ setEvents(function(prev){ return prev.filter(function(e){ return e.id!==id; }); }); setSelected(null); }}
          onClose={function(){ setSelected(null); }} />
      )}

      <PeopleDrawer
        open={drawerOpen}
        pool={pool}
        absences={absences}
        holidays={holidays}
        teams={teams}
        onUpdatePool={setPool}
        onUpdateAbsences={function(name,days){ setAbsences(function(prev){ var n=Object.assign({},prev); n[name]=days; return n; }); }}
        onUpdateHolidays={setHolidays}
        onClose={function(){ setDrawerOpen(false); }}
      />
    </div>
  );
}
