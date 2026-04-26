import { PrismaClient } from "@prisma/client";
import { menuItems } from "../src/data/menuData";

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.menuItem.deleteMany();

  await prisma.menuItem.createMany({
    data: menuItems.map((item) => ({
      category: item.category,
      name: item.name,
      ingredients: item.ingredients,
      prices: JSON.stringify(item.prices),
      image: item.image,
      description: item.description,
      locations: JSON.stringify(item.locations),
      exactAddresses: item.exactAddresses
        ? JSON.stringify(item.exactAddresses)
        : null,
      likesCount: 0,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    throw error;
  });
