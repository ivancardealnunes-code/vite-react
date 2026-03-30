import * as Mod from "./studio-calendar";

function pickComponent(moduleObj) {
  // tenta default export
  if (moduleObj.default && typeof moduleObj.default === "function") {
    return moduleObj.default;
  }

  // tenta função com nome comum
  if (typeof moduleObj.StudioCalendar === "function") {
    return moduleObj.StudioCalendar;
  }

  // tenta achar qualquer função exportada
  const found = Object.values(moduleObj).find(
    (v) => typeof v === "function"
  );

  return found || null;
}

const Comp = pickComponent(Mod);

export default function App() {
  if (!Comp) {
    return <div style={{ padding: 20 }}>❌ Nenhum componente encontrado</div>;
  }
  return <Comp />;
}
