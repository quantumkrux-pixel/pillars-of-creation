// ═══════════════════════════════════════════════════════════════════
// useAuth.js — Eldenmoor hero session management
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";

const LS_KEY = "eldenmoor_hero";

export function useAuth() {
  const [username, setUsername] = useState(() => {
    try { return localStorage.getItem(LS_KEY) || null; }
    catch { return null; }
  });

  const login = (name) => {
    const clean = name.trim().slice(0, 24);
    if (!clean) return;
    try { localStorage.setItem(LS_KEY, clean); } catch {}
    setUsername(clean);
  };

  const logout = () => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setUsername(null);
  };

  return { username, login, logout, isLoggedIn: !!username };
}
