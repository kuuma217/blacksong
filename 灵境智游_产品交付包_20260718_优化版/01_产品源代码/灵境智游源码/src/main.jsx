import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import TargetCursor from "./components/TargetCursor.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <TargetCursor
        targetSelector={'button:not(:disabled), a[href], input:not([type="hidden"]), select, textarea, label[for], summary, [role="button"], [tabindex]:not([tabindex="-1"]), .drop-zone, .cursor-target'}
        spinDuration={2.4}
        hideDefaultCursor
        parallaxOn
        cursorColor="#2d7664"
        cursorColorOnTarget="#c29245"
      />
      <App />
    </>
  </StrictMode>
);
