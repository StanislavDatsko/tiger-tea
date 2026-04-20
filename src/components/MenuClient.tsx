"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toggleLike, type MenuItemDTO } from "@/app/actions";
import type { Location } from "@/data/menuData";

type MenuClientProps = {
  initialItems: MenuItemDTO[];
  categories: string[];
};

const LIKED_ITEMS_STORAGE_KEY = "tiger_tea_likes";

function formatPrices(prices: MenuItemDTO["prices"]): string {
  if (prices.M && prices.L) return `${prices.M} • ${prices.L}`;
  if (prices.M) return prices.M;
  if (prices.L) return prices.L;
  return "Уточнюйте ціну";
}

function TigerStripesIcon() {
  return (
    <svg
      viewBox="0 0 240 80"
      className="absolute inset-0 h-full w-full opacity-20"
      aria-hidden
    >
      <path d="M0 65C30 35 44 35 76 65" stroke="currentColor" strokeWidth="10" fill="none" />
      <path d="M55 65C85 26 100 26 132 65" stroke="currentColor" strokeWidth="10" fill="none" />
      <path d="M110 65C140 30 157 30 188 65" stroke="currentColor" strokeWidth="10" fill="none" />
      <path d="M165 65C194 38 210 38 240 65" stroke="currentColor" strokeWidth="10" fill="none" />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12 21s-7.5-4.5-9.5-9.1C.9 8.2 2.3 5 5.6 5c2.1 0 3.2 1.2 4.1 2.4C10.6 6.2 11.8 5 13.9 5c3.2 0 4.8 3.1 3.2 6.8C19.2 16.5 12 21 12 21z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function LocationButton({
  value,
  current,
  onSelect,
  children,
}: {
  value: Location;
  current: Location;
  onSelect: (value: Location) => void;
  children: React.ReactNode;
}) {
  const isActive = value === current;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
        isActive
          ? "bg-brand-accent text-white shadow-sm"
          : "bg-white text-brand-primary ring-1 ring-brand-primary/20"
      }`}
    >
      {children}
    </button>
  );
}

export function MenuClient({ initialItems, categories }: MenuClientProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location>("lviv");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categories[0] ?? "Лате",
  );
  const [items, setItems] = useState<MenuItemDTO[]>(initialItems);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIKED_ITEMS_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Record<string, boolean>;
      if (parsed && typeof parsed === "object") {
        setLikedItems(parsed);
      }
    } catch {
      setLikedItems({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LIKED_ITEMS_STORAGE_KEY, JSON.stringify(likedItems));
  }, [likedItems]);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.category === selectedCategory &&
          item.locations.includes(selectedLocation),
      ),
    [items, selectedCategory, selectedLocation],
  );

  function handleLike(itemId: string, event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (isPending) return;

    const alreadyLiked = Boolean(likedItems[itemId]);
    const isLiking = !alreadyLiked;

    setLikedItems((prev) => {
      if (isLiking) {
        return { ...prev, [itemId]: true };
      }
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, likes: Math.max(0, item.likes + (isLiking ? 1 : -1)) }
          : item,
      ),
    );

    setSelectedItem((prev) =>
      prev && prev.id === itemId
        ? {
            ...prev,
            likes: Math.max(0, prev.likes + (isLiking ? 1 : -1)),
          }
        : prev,
    );

    startTransition(async () => {
      try {
        const nextLikes = await toggleLike(itemId, isLiking);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, likes: nextLikes } : item,
          ),
        );
        setSelectedItem((prev) =>
          prev && prev.id === itemId ? { ...prev, likes: nextLikes } : prev,
        );
      } catch {
        setLikedItems((prev) => {
          if (alreadyLiked) {
            return { ...prev, [itemId]: true };
          }
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, likes: Math.max(0, item.likes + (alreadyLiked ? 1 : -1)) }
              : item,
          ),
        );
        setSelectedItem((prev) =>
          prev && prev.id === itemId
            ? {
                ...prev,
                likes: Math.max(0, prev.likes + (alreadyLiked ? 1 : -1)),
              }
            : prev,
        );
      }
    });
  }

  return (
    <div className="min-h-full flex-1 bg-gradient-to-b from-white via-orange-50/20 to-white pb-10">
      <div className="sticky top-0 z-30 border-b border-brand-primary/10 bg-white/95 backdrop-blur">
        <header className="relative overflow-hidden bg-brand-primary px-4 py-4 text-white">
          <TigerStripesIcon />
          <h1 className="relative text-center text-2xl font-bold tracking-wide animate-pulse">
            Tiger Tea
          </h1>
        </header>

        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold text-brand-primary">Оберіть локацію:</p>
          <div className="flex gap-2">
            <LocationButton
              value="lviv"
              current={selectedLocation}
              onSelect={setSelectedLocation}
            >
              Львів
            </LocationButton>
            <LocationButton
              value="kyiv"
              current={selectedLocation}
              onSelect={setSelectedLocation}
            >
              Київ
            </LocationButton>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const isActive = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand-accent text-white shadow-sm"
                    : "bg-white text-brand-primary ring-1 ring-brand-primary/15"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-lg px-4 pt-4">
        <ul className="space-y-3">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full rounded-xl bg-white p-3 text-left shadow-md ring-1 ring-brand-primary/10 transition-all hover:scale-105"
              >
                <article className="relative flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl bg-zinc-100 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.png";
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-zinc-900">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {item.ingredients}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-brand-accent">
                      {formatPrices(item.prices)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleLike(item.id, event)}
                    aria-label={`Лайк ${item.name}`}
                    className={`absolute right-1 top-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition ${
                      likedItems[item.id]
                        ? "bg-orange-100 text-brand-accent"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <HeartIcon active={Boolean(likedItems[item.id])} />
                    <span>{item.likes}</span>
                  </button>
                </article>
              </button>
            </li>
          ))}
        </ul>

        {filteredItems.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center text-sm text-zinc-500 shadow-sm ring-1 ring-brand-primary/10">
            У цій категорії поки немає позицій для обраної локації.
          </div>
        ) : null}
      </main>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl animate-[modalIn_220ms_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-brand-primary">{selectedItem.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full bg-zinc-100 px-2 py-1 text-sm font-semibold text-zinc-600"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="mb-4 h-52 w-full rounded-xl bg-zinc-100 object-cover"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.png";
              }}
            />

            <div className="space-y-3 text-sm text-zinc-700">
              <p>
                <span className="font-semibold text-brand-primary">Склад: </span>
                {selectedItem.ingredients}
              </p>
              <p>{selectedItem.description}</p>
              <div className="rounded-xl bg-orange-50 px-3 py-2 text-brand-primary">
                <p className="font-semibold">Ціни:</p>
                <p>M: {selectedItem.prices.M ?? "—"}</p>
                <p>L: {selectedItem.prices.L ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
