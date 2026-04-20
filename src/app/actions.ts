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
  likes: number;
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

export async function getMenuItems(): Promise<MenuItemDTO[]> {
  const items = await prisma.menuItem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
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
    likes: item.likes,
  }));
}

export async function incrementLike(id: string): Promise<number> {
  const updated = await prisma.menuItem.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });

  return updated.likes;
}
