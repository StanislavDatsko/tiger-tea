"use client";

import { useMemo, useState } from "react";
import {
  categories,
  menuItems,
  type MenuCategory,
  type MenuItem,
} from "@/data/menu";

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

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>(
    categories[0],
  );

  const visibleItems = useMemo(
    () => menuItems.filter((item) => item.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="min-h-full flex-1 bg-zinc-100 pb-8">
      <div className="sticky top-0 z-30 shadow-md">
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
    </div>
  );
}
