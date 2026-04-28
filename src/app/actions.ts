"use server";

import { prisma } from "@/lib/prisma";
import type { Location } from "@/data/menuData";

export type PriceBySize = { M?: string; L?: string };
export type ParsedPrices = Partial<Record<Location, PriceBySize>>;
export type ParsedExactAddresses = Partial<Record<Location, string[]>>;

export type MenuItemDTO = {
  id: string;
  category: string;
  name: string;
  ingredients: string;
  prices: ParsedPrices;
  image: string;
  description: string;
  locations: Location[];
  exactAddresses: ParsedExactAddresses;
  likesCount: number;
  isLiked: boolean;
};

function parsePrices(value: string): ParsedPrices {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const locations: Location[] = ["lviv", "kyiv"];
    const normalized: ParsedPrices = {};

    for (const location of locations) {
      const candidate = (parsed as Record<string, unknown>)[location];
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
        continue;
      }

      const source = candidate as Record<string, unknown>;
      normalized[location] = {
        M: typeof source.M === "string" ? source.M : undefined,
        L: typeof source.L === "string" ? source.L : undefined,
      };
    }

    // Backward compatibility: old shape { M, L }.
    if (!normalized.lviv && !normalized.kyiv) {
      const source = parsed as Record<string, unknown>;
      if (typeof source.M === "string" || typeof source.L === "string") {
        const fallback = {
          M: typeof source.M === "string" ? source.M : undefined,
          L: typeof source.L === "string" ? source.L : undefined,
        };
        normalized.lviv = fallback;
        normalized.kyiv = fallback;
      }
    }

    return normalized;
  } catch {
    return {};
  }
}

function parseLocations(value: string): Location[] {
  try {
    const parsed = JSON.parse(value) as string[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (location): location is Location =>
        location === "lviv" || location === "kyiv",
    );
  } catch {
    return [];
  }
}

function parseExactAddresses(value: string | null): ParsedExactAddresses {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const locations: Location[] = ["lviv", "kyiv"];
    const normalized: ParsedExactAddresses = {};

    for (const location of locations) {
      const candidate = (parsed as Record<string, unknown>)[location];
      if (!Array.isArray(candidate)) continue;
      normalized[location] = candidate.filter(
        (entry): entry is string => typeof entry === "string",
      );
    }

    return normalized;
  } catch {
    return {};
  }
}

export async function getMenuItems(tgUserId?: string): Promise<MenuItemDTO[]> {
  const userId = tgUserId?.trim();

  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
            take: 1,
          }
        : false,
    },
  });

  return items.map((item) => ({
    id: item.id,
    category: item.category,
    name: item.name,
    ingredients: item.ingredients,
    prices: parsePrices(item.prices),
    image: item.image,
    description: item.description,
    locations: parseLocations(item.locations),
    exactAddresses: parseExactAddresses(item.exactAddresses),
    likesCount: Math.max(0, item.likesCount),
    isLiked: userId ? item.likes.length > 0 : false,
  }));
}

export async function toggleLike(
  itemId: string,
  tgUserId: string,
): Promise<{ likesCount: number; isLiked: boolean }> {
  const userId = tgUserId.trim();
  if (!userId) {
    throw new Error("Telegram user id is required.");
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingLike = await tx.like.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      select: { id: true },
    });

    if (existingLike) {
      await tx.like.delete({
        where: { id: existingLike.id },
      });

      await tx.menuItem.updateMany({
        where: {
          id: itemId,
          likesCount: { gt: 0 },
        },
        data: { likesCount: { decrement: 1 } },
      });

      const updated = await tx.menuItem.findUnique({
        where: { id: itemId },
        select: { likesCount: true },
      });
      if (!updated) {
        throw new Error("Menu item not found.");
      }

      return {
        likesCount: Math.max(0, updated.likesCount),
        isLiked: false,
      };
    }

    await tx.like.create({
      data: {
        userId,
        itemId,
      },
    });

    const updated = await tx.menuItem.update({
      where: { id: itemId },
      data: { likesCount: { increment: 1 } },
      select: { likesCount: true },
    });

    return {
      likesCount: Math.max(0, updated.likesCount),
      isLiked: true,
    };
  });

  return result;
}
