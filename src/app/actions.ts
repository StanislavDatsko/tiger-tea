"use server";

import { prisma } from "@/lib/prisma";
import type { Location } from "@/data/menuData";

export type ParsedPrices = {
  M?: string;
  L?: string;
};

export type MenuItemDTO = {
  id: string;
  category: string;
  name: string;
  ingredients: string;
  prices: ParsedPrices;
  image: string;
  description: string;
  locations: Location[];
  likesCount: number;
  isLiked: boolean;
};

function parsePrices(value: string): ParsedPrices {
  try {
    const parsed = JSON.parse(value) as ParsedPrices;
    return parsed && typeof parsed === "object" ? parsed : {};
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

export async function getMenuItems(tgUserId?: string): Promise<MenuItemDTO[]> {
  const userId = tgUserId?.trim();

  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { likes: true },
      },
      likes: {
        where: { userId: userId ?? "__anonymous__" },
        select: { id: true },
        take: 1,
      },
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
    likesCount: item._count.likes || 0,
    isLiked: item.likes.length > 0,
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

      const updated = await tx.menuItem.update({
        where: { id: itemId },
        data: { likesCount: { decrement: 1 } },
        select: { likesCount: true },
      });

      return {
        likesCount: updated.likesCount,
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
      likesCount: updated.likesCount,
      isLiked: true,
    };
  });

  return result;
}
