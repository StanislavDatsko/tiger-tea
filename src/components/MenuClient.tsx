"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { getMenuItems, toggleLike, type MenuItemDTO } from "@/app/actions";
import type { Location } from "@/data/menuData";

type MenuClientProps = {
  initialItems: MenuItemDTO[];
  categories: string[];
};
type TelegramWebAppUser = {
  id?: number;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void;
        initDataUnsafe?: {
          user?: TelegramWebAppUser;
        };
      };
    };
  }
}

function formatPrices(
  prices: MenuItemDTO["prices"],
  selectedLocation: Location,
): string {
  const selectedPrices = prices[selectedLocation];
  if (!selectedPrices) return "Уточнюйте ціну";
  if (selectedPrices.M && selectedPrices.L) {
    return `${selectedPrices.M} • ${selectedPrices.L}`;
  }
  if (selectedPrices.M) return selectedPrices.M;
  if (selectedPrices.L) return selectedPrices.L;
  return "Уточнюйте ціну";
}

function sortCategoriesWithDessertsLast(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    if (a === "Десерти") return 1;
    if (b === "Десерти") return -1;
    return a.localeCompare(b, "uk");
  });
}

function TigerPawPattern({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={`absolute h-36 w-36 text-white/15 ${className}`}
      aria-hidden
    >
      <g fill="currentColor">
        <ellipse cx="66" cy="50" rx="16" ry="22" transform="rotate(-18 66 50)" />
        <ellipse cx="103" cy="36" rx="16" ry="22" transform="rotate(-5 103 36)" />
        <ellipse cx="141" cy="36" rx="16" ry="22" transform="rotate(8 141 36)" />
        <ellipse cx="175" cy="52" rx="16" ry="22" transform="rotate(18 175 52)" />
        <path d="M62 118c0-25 22-45 49-45h18c27 0 49 20 49 45 0 34-24 58-58 58s-58-24-58-58Z" />
      </g>
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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12.6 3.5h2.6c.3 2.1 1.7 3.6 3.8 4v2.6a8 8 0 0 1-3.7-1V14a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v2.9a3.3 3.3 0 1 0 2.4 3.1V3.5Z"
        fill="currentColor"
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
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-violet-900/30"
          : "bg-white/10 text-white ring-1 ring-white/35 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export function MenuClient({ initialItems, categories }: MenuClientProps) {
  const orderedCategories = useMemo(
    () => sortCategoriesWithDessertsLast(categories),
    [categories],
  );
  const [selectedLocation, setSelectedLocation] = useState<Location>("lviv");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    orderedCategories[0] ?? "Лате",
  );
  const [items, setItems] = useState<MenuItemDTO[]>(initialItems);
  const [tgUserId, setTgUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likeError, setLikeError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItemDTO | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeCategory = orderedCategories.includes(selectedCategory)
    ? selectedCategory
    : (orderedCategories[0] ?? "Лате");

  useEffect(() => {
    const bootstrapMenu = async () => {
      let resolvedUserId = "browser-test-user";
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready?.();
        const id = window.Telegram.WebApp.initDataUnsafe?.user?.id;
        if (id) {
          resolvedUserId = String(id);
        }
      }

      setTgUserId(resolvedUserId);
      console.log("Отриманий Telegram ID:", resolvedUserId);

      try {
        const fetchedItems = await getMenuItems(resolvedUserId);
        console.log("Завантажене меню:", fetchedItems);
        setItems(fetchedItems);
      } catch {
        setLikeError("Не вдалося завантажити лайки. Оновіть сторінку.");
      } finally {
        setIsLoading(false);
      }
    };

    startTransition(() => {
      void bootstrapMenu();
    });
  }, []);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.category === activeCategory &&
          item.locations.includes(selectedLocation),
      ),
    [activeCategory, items, selectedLocation],
  );

  function handleLike(itemId: string, event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (isPending || !tgUserId) return;
    setLikeError(null);

    const currentItem = items.find((item) => item.id === itemId);
    const isLiking = !currentItem?.isLiked;

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              isLiked: isLiking,
              likesCount: Math.max(
                0,
                item.likesCount + (isLiking ? 1 : -1),
              ),
            }
          : item,
      ),
    );

    setSelectedItem((prev) =>
      prev && prev.id === itemId
        ? {
            ...prev,
            isLiked: isLiking,
            likesCount: Math.max(
              0,
              prev.likesCount + (isLiking ? 1 : -1),
            ),
          }
        : prev,
    );

    startTransition(async () => {
      try {
        const result = await toggleLike(itemId, tgUserId);
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  likesCount: result.likesCount,
                  isLiked: result.isLiked,
                }
              : item,
          ),
        );
        setSelectedItem((prev) =>
          prev && prev.id === itemId
            ? {
                ...prev,
                likesCount: result.likesCount,
                isLiked: result.isLiked,
              }
            : prev,
        );
      } catch {
        // Rollback optimistic update on failure
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  isLiked: !isLiking,
                  likesCount: Math.max(
                    0,
                    item.likesCount + (isLiking ? -1 : 1),
                  ),
                }
              : item,
          ),
        );
        setSelectedItem((prev) =>
          prev && prev.id === itemId
            ? {
                ...prev,
                isLiked: !isLiking,
                likesCount: Math.max(
                  0,
                  prev.likesCount + (isLiking ? -1 : 1),
                ),
              }
            : prev,
        );
        setLikeError("Не вдалося оновити лайк. Спробуйте ще раз.");
      }
    });
  }

  return (
    <div className="relative min-h-full flex-1 overflow-hidden bg-gradient-to-br from-[#090322] via-[#21105f] to-[#5b2dd8] pb-28 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <TigerPawPattern className="left-[6%] top-[10%] animate-[pawDrift_14s_ease-in-out_infinite]" />
        <TigerPawPattern className="right-[8%] top-[18%] h-28 w-28 animate-[pawDrift_16s_ease-in-out_infinite_0.8s]" />
        <TigerPawPattern className="left-[18%] bottom-[18%] h-24 w-24 animate-[pawDrift_12s_ease-in-out_infinite_0.3s]" />
        <TigerPawPattern className="right-[15%] bottom-[12%] animate-[pawDrift_18s_ease-in-out_infinite_1.1s]" />
        <TigerPawPattern className="left-[45%] top-[38%] h-20 w-20 animate-[pawDrift_15s_ease-in-out_infinite_0.5s]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(160,128,255,0.35),transparent_38%),radial-gradient(circle_at_50%_80%,rgba(110,75,255,0.26),transparent_45%)]" />
      </div>

      <div className="relative z-10 sticky top-0 border-b border-white/15 bg-[#0c072f]/75 backdrop-blur-xl">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <img
            src="/logo.jpg"
            alt="Tiger Tea logo"
            className="h-14 w-14 rounded-2xl border border-white/25 object-cover shadow-lg shadow-violet-950/45"
          />
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-[0.15em] text-white sm:text-3xl">
              TIGER TEA
            </h1>
            <p className="text-xs tracking-[0.22em] text-indigo-100/90">PREMIUM BUBBLE LAB</p>
          </div>
          <img
            src="/logo2.jpg"
            alt="Tiger Tea badge"
            className="h-14 w-14 rounded-2xl border border-white/25 object-cover shadow-lg shadow-violet-950/45"
          />
        </header>

        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-indigo-100">Оберіть локацію:</p>
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

        <nav className="mobile-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
          {orderedCategories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-white text-[#1f1264] shadow-lg shadow-violet-900/35"
                    : "bg-white/8 text-indigo-50 ring-1 ring-white/30 hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>
      </div>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-6 px-4 pt-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <aside className="order-2 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl shadow-2xl shadow-black/20 lg:order-1">
          <img
            src="/tiger.png"
            alt="Tiger Tea mascot with bubble tea"
            className="mx-auto h-64 w-full max-w-xs object-contain drop-shadow-[0_16px_30px_rgba(8,4,40,0.6)] transition-transform duration-500 hover:scale-105"
          />
          <p className="mt-4 text-center text-sm text-indigo-100/95">
            Signature taste with tiger spirit. Обирайте улюблене bubble tea та ставте лайки.
          </p>
        </aside>

        <section className="order-1 space-y-3 lg:order-2">
        {likeError ? (
          <div className="rounded-2xl border border-red-300/50 bg-red-500/15 px-3 py-2 text-sm text-red-100">
            {likeError}
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-2xl border border-white/20 bg-white/12 p-6 text-center text-sm text-indigo-100">
            Завантаження меню...
          </div>
        ) : null}
        <ul className="space-y-3">
          {!isLoading &&
            filteredItems.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full rounded-2xl border border-white/20 bg-white/12 p-3 text-left shadow-xl shadow-indigo-950/35 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
              >
                <article className="relative flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-24 w-24 rounded-xl bg-white/20 object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.png";
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-white">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-indigo-100/90">
                      {item.ingredients}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-violet-100">
                      {formatPrices(item.prices, selectedLocation)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(event) => handleLike(item.id, event)}
                    aria-label={`Лайк ${item.name}`}
                    className={`absolute right-1 top-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      item.isLiked
                        ? "bg-white text-[#3b208a]"
                        : "bg-white/25 text-indigo-100"
                    }`}
                  >
                    <HeartIcon active={item.isLiked} />
                    <span>{item.likesCount}</span>
                  </button>
                </article>
              </button>
            </li>
          ))}
        </ul>

        {!isLoading && filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 text-center text-sm text-indigo-100">
            У цій категорії поки немає позицій для обраної локації.
          </div>
        ) : null}
        </section>
      </main>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/20 bg-[#f8f7ff] p-4 text-[#1f1652] shadow-2xl animate-[modalIn_220ms_ease-out]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold text-[#32206f]">{selectedItem.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full bg-violet-100 px-2 py-1 text-sm font-semibold text-[#4b2da6]"
                aria-label="Закрити"
              >
                ✕
              </button>
            </div>

            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="mb-4 h-52 w-full rounded-xl bg-[#f2efff] object-contain"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.png";
              }}
            />

            <div className="space-y-3 text-sm text-[#3a2f66]">
              <p>
                <span className="font-semibold text-[#32206f]">Склад: </span>
                {selectedItem.ingredients}
              </p>
              <p>{selectedItem.description}</p>
              <div className="rounded-xl bg-violet-100 px-3 py-2 text-[#32206f]">
                <p className="font-semibold">Ціни:</p>
                <p>M: {selectedItem.prices[selectedLocation]?.M ?? "—"}</p>
                <p>L: {selectedItem.prices[selectedLocation]?.L ?? "—"}</p>
              </div>
              {selectedItem.exactAddresses[selectedLocation]?.length ? (
                <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-3 py-2 text-[#2b1e61]">
                  <p className="font-semibold text-[#32206f]">
                    Доступно за адресами:
                  </p>
                  <ul className="mt-1 space-y-1">
                    {selectedItem.exactAddresses[selectedLocation]?.map(
                      (address) => (
                        <li key={address} className="text-sm">
                          {address}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[min(94%,560px)] items-center justify-around rounded-2xl border border-white/25 bg-[#0d0832]/80 px-3 py-2 backdrop-blur-xl shadow-[0_14px_36px_rgba(8,3,34,0.55)]">
        <a
          href="https://www.instagram.com/tigertea.lviv?igsh=MTQ2Y3FuZmQ4ZDdtZA=="
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-indigo-50 transition hover:bg-white/20"
        >
          <InstagramIcon />
          <span className="text-xs font-semibold tracking-wide">Lviv</span>
        </a>
        <a
          href="https://www.instagram.com/tigertea.kyiv.smart_plaza?igsh=MWNobHozODBvZmM2dg=="
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-indigo-50 transition hover:bg-white/20"
        >
          <InstagramIcon />
          <span className="text-xs font-semibold tracking-wide">Kyiv</span>
        </a>
        <a
          href="https://www.tiktok.com/@tiger_tea?_r=1&_t=ZS-95dswLmExVp"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 rounded-xl px-3 py-2 text-indigo-50 transition hover:bg-white/20"
        >
          <TikTokIcon />
          <span className="text-xs font-semibold tracking-wide">TikTok</span>
        </a>
      </nav>
    </div>
  );
}
