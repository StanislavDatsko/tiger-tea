"use client";

import { useCallback, useMemo, useState } from "react";
import {
  categories,
  menuItems,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";

function IconMenu({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6h16M4 12h16M4 18h10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function IconTikTok({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
      />
    </svg>
  );
}

function ItemThumbnail({ item }: { item: MenuItem }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="h-full w-full bg-zinc-200"
        aria-hidden
      />
    );
  }

  return (
    <img
      src={item.image}
      alt={item.name}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/tigertea.lviv?igsh=MTQ2Y3FuZmQ4ZDdtZA==",
    label: "Inst Lviv",
  },
  {
    href: "https://www.instagram.com/tigertea.kyiv.smart_plaza?igsh=MWNobHozODBvZmM2dg==",
    label: "Inst Kyiv",
  },
  {
    href: "https://www.tiktok.com/@tiger_tea?_r=1&_t=ZS-95dswLmExVp",
    label: "TikTok",
  },
] as const;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>(
    categories[0],
  );

  const visibleItems = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  const scrollToMenuTop = useCallback(() => {
    document.getElementById("menu-top")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return (
    <div className="min-h-full flex-1 bg-zinc-100 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
      <div
        id="menu-top"
        className="sticky top-0 z-30 scroll-mt-0 shadow-md"
      >
        <header className="bg-brand-primary px-4 py-4 text-center text-lg font-semibold tracking-tight text-white">
          Tiger Tea
        </header>
        <nav
          className="flex gap-2 overflow-x-auto border-b border-zinc-200/80 bg-white/95 px-4 py-3 backdrop-blur-sm [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Категорії меню"
        >
          {categories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-accent text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-700 active:bg-zinc-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-lg px-4 pt-5">
        <ul className="flex flex-col gap-3">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <article className="flex gap-3 rounded-xl bg-white p-3 shadow-md ring-1 ring-zinc-100/80">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  <ItemThumbnail item={item} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 py-0.5">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold leading-snug text-zinc-900">
                      {item.name}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-brand-accent">
                    {item.price} ₴
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/90 bg-white/85 shadow-[0_-4px_24px_rgba(0,51,102,0.12)] backdrop-blur-md supports-[backdrop-filter]:bg-white/75"
        aria-label="Навігація та соцмережі"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2">
          <button
            type="button"
            onClick={scrollToMenuTop}
            className="flex min-w-0 max-w-[25%] flex-1 flex-col items-center gap-1 rounded-lg py-1 text-brand-accent transition-opacity active:opacity-80"
          >
            <IconMenu className="h-6 w-6 shrink-0" />
            <span className="text-center text-xs font-semibold leading-tight">
              Меню
            </span>
          </button>

          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 max-w-[25%] flex-1 flex-col items-center gap-1 rounded-lg py-1 text-brand-primary transition-opacity active:opacity-80"
            >
              {link.label === "TikTok" ? (
                <IconTikTok className="h-6 w-6 shrink-0" />
              ) : (
                <IconInstagram className="h-6 w-6 shrink-0" />
              )}
              <span className="max-w-full truncate text-center text-xs leading-tight text-brand-primary">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
