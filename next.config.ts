import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Дозволити HMR (webpack-hmr) при відкритті dev-сервера через ngrok / інший публічний хост.
  // Якщо ngrok видасть новий піддомен — додайте його сюди і перезапустіть `npm run dev`.
  allowedDevOrigins: ["infrangible-overloftily-shamika.ngrok-free.dev"],
};

export default nextConfig;
