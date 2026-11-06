import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";
const Admin = lazy(() => import("./pages/Admin"));
const Pengundang = lazy(() => import("./pages/Pengundang"));

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname, search]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <LanguageProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Suspense fallback={<div style={{ minHeight: "100vh" }} />}><Admin /></Suspense>} />
          <Route path="/referral" element={<Suspense fallback={<div style={{ minHeight: "100vh" }} />}><Pengundang /></Suspense>} />
          <Route path="/pengundang" element={<Navigate to="/referral" replace />} />
          <Route path="/referral-partner" element={<Navigate to="/referral" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}
