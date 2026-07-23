import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<div className="p-8 text-2xl font-bold">Roomly 🏠</div>} />
      </Route>
    </Routes>
  );
}

export default App;
