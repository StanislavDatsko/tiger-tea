"use client";

import { useEffect } from "react";

const SCRIPT_ID = "telegram-web-app-js";
const SCRIPT_SRC = "https://telegram.org/js/telegram-web-app.js";

/** Telegram SDK після hydration, щоб не було mismatch на `<html>`. */
export function TelegramWebAppScript() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return null;
}
