import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { LocaleSync } from "@/components/LocaleSync";
import "@/i18n";
import { LandingPage } from "@/pages/Landing";
import { PrivacyPage } from "@/pages/Privacy";
import { SessionPage } from "@/pages/Session";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
