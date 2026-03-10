import { useState, useCallback } from "react";

const DEFAULTS = {
  refreshInterval: "5",
};

function readSettings() {
  try {
    const raw = localStorage.getItem("recuperai-settings");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function writeSettings(settings) {
  localStorage.setItem("recuperai-settings", JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState(readSettings);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      writeSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSetting };
}
