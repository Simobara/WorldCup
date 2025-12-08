import { createRoot } from "react-dom/client";
import App from "./Ap/App";
import "./Ap/App.css"; // ⬅️ IMPORTANTE

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
