// ═══════════════════════════════════════════════════════════════════
// usePersistence.js — Eldenmoor map save/load
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { emptyMap } from "./constants";

const LS_MAP_KEY     = "eldenmoor_map";
const LS_TILES_KEY   = "eldenmoor_custom_tiles";
const SCHEMA_VERSION = 1;

export function usePersistence({ mapLayers, setMapLayers, customTiles, setCustomTiles, spawnPos, setSpawnPos }) {
  const [saveStatus, setSaveStatus] = useState("idle");
  const debounceRef  = useRef(null);
  const isFirstMount = useRef(true);

  // Autoload
  useEffect(() => {
    try {
      const rawMap   = localStorage.getItem(LS_MAP_KEY);
      const rawTiles = localStorage.getItem(LS_TILES_KEY);
      if (rawMap) {
        const parsed = JSON.parse(rawMap);
        if (parsed?.version === SCHEMA_VERSION && parsed?.mapLayers) setMapLayers(parsed.mapLayers);
        if (parsed?.spawnPos) setSpawnPos(parsed.spawnPos);
      }
      if (rawTiles) {
        const parsed = JSON.parse(rawTiles);
        if (parsed && typeof parsed === "object") setCustomTiles(parsed);
      }
    } catch (err) {
      console.warn("[Eldenmoor] Failed to load save:", err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave (debounced 800ms)
  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LS_MAP_KEY, JSON.stringify({ version: SCHEMA_VERSION, savedAt: new Date().toISOString(), mapLayers, spawnPos }));
        localStorage.setItem(LS_TILES_KEY, JSON.stringify(customTiles));
        setSaveStatus("saved");
      } catch (err) {
        console.warn("[Eldenmoor] Autosave failed:", err);
        setSaveStatus("error");
      }
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [mapLayers, customTiles, spawnPos]);

  const exportMap = () => {
    try {
      const blob = new Blob([JSON.stringify({ version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), mapLayers, customTiles, spawnPos }, null, 2)], { type: "application/json" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `eldenmoor_map_${Date.now()}.json`; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.warn("[Eldenmoor] Export failed:", err); }
  };

  const importMap = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed?.mapLayers) throw new Error("Invalid map file");
        setMapLayers(parsed.mapLayers);
        if (parsed.customTiles) setCustomTiles(parsed.customTiles);
        if (parsed.spawnPos) setSpawnPos(parsed.spawnPos);
        setSaveStatus("saved");
      } catch (err) {
        console.warn("[Eldenmoor] Import failed:", err);
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    };
    reader.readAsText(file);
  };

  const clearMap = () => {
    setMapLayers(emptyMap());
    setCustomTiles({});
    try { localStorage.removeItem(LS_MAP_KEY); localStorage.removeItem(LS_TILES_KEY); } catch (_) {}
    setSaveStatus("idle");
  };

  return { saveStatus, exportMap, importMap, clearMap };
}
