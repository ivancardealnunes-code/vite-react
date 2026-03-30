import { useState, useRef, useEffect, useMemo } from "react";

// ─── CONFIGURAÇÕES E TEMA ──────────────────────────────────────────────────────
const T = {
  bg:"#F5F6F8", surface:"#FFFFFF", border:"#E5E7EB",
  text:"#111827", textMid:"#6B7280", textLight:"#9CA3AF",
  today:"#7B68EE", todayBg:"#EEF2FF",
  dropBg:"#F0FDF4", dropBorder:"#22C55E",
  warn:"#F59E0B", warnBg:"#FFFBEB", warnBorder:"#FDE68A",
  holiday:"#EF4444", holidayBg:"#FEF2F2", holidayBorder:"#FCA5A5",
  shortFri:"#8B5CF6", shortFriBg:"#F5F3FF", shortFriBorder:"#DDD6FE",
};

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

// ... (Demais constantes como AREAS, LEVELS, MONTHS_PT permanecem iguais)
const MONTHS_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const YEAR = 2026;

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:10, color:T.textLight, fontWeight:600, letterSpacing:0.8, textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      {children}
    </div>
  );
}

function Av({ person, size = 26 }) {
  if (!person) return null;
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background:person.color || "#888", border:"2px solid #fff",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size * 0.35, color:"#fff", fontWeight:700, flexShrink:0,
    }}>
      {(person.initials || person.name || "?").slice(0,1)}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function App() {
  const [events, setEvents] = useState([]); // Aqui você pode usar buildEvents() do seu arquivo
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // Lógica para renderizar os dias do calendário (Simplificada para funcionalidade)
  const daysInMonth = new Date(YEAR, viewMonth + 1, 0).getDate();
  const firstDay = new Date(YEAR, viewMonth, 1).getDay();

  return (
    <div style={{ display:"flex", height:"100vh", background:T.bg, fontFamily:"Inter, sans-serif", overflow:"hidden", flexDirection:"column" }}>
      {/* Top Bar */}
      <div style={{ height:52, background:"#fff", borderBottom:"1px solid "+T.border, display:"flex", alignItems:"center", padding:"0 20px", justifyContent:"space-between" }}>
        <div style={{ fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:T.today }}>◈</span> Studio Calendar 2026
        </div>
        <button 
          onClick={() => setDrawerOpen(!drawerOpen)}
          style={{ background:T.bg, border:"1px solid "+T.border, padding:"6px 12px", borderRadius:6, cursor:"pointer", fontSize:12 }}
        >
          {drawerOpen ? "Fechar Painel" : "👥 Pessoas"}
        </button>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* Calendar Grid */}
        <div style={{ flex:1, padding:20, overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
             <h2 style={{ fontSize:18 }}>{MONTHS_PT[viewMonth]}</h2>
             <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setViewMonth(m => Math.max(0, m-1))}>‹</button>
                <button onClick={() => setViewMonth(m => Math.min(11, m+1))}>›</button>
             </div>
          </div>
          
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:1, background:T.border, border:"1px solid "+T.border }}>
            {WEEKDAYS.map(wd => <div key={wd} style={{ background:"#f9fafb", padding:10, textAlign:"center", fontSize:12, fontWeight:600 }}>{wd}</div>)}
            {Array.from({ length: firstDay }).map((_, i) => <div key={i} style={{ background:"#fff", minHeight:100 }} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => (
              <div key={i} style={{ background:"#fff", minHeight:100, padding:8, fontSize:12 }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / People Drawer */}
        {drawerOpen && (
          <div style={{ width:320, background:"#fff", borderLeft:"1px solid "+T.border, padding:20, overflowY:"auto" }}>
            <h3 style={{ fontSize:14, marginBottom:15 }}>Equipe e Capacidade</h3>
            {/* Aqui entraria a lista do seu INIT_POOL */}
          </div>
        )}
      </div>
    </div>
  );
}
