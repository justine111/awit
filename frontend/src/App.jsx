import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import ControlWindow from "@/pages/ControlWindow";
import DisplayWindow from "@/pages/DisplayWindow";

// Two "pages" that are really two separate app modes:
//  - /control  the operator's panel (search, queue, next/prev)
//  - /display  the fullscreen projector output, opened in its own window
//
// HashRouter is used so this works from a plain `vite build` static
// file too (no server-side routing needed).
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        <Route path="/control" element={<ControlWindow />} />
        <Route path="/display" element={<DisplayWindow />} />
      </Routes>
    </HashRouter>
  );
}
