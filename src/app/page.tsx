import { getMenuItems } from "@/app/actions";
import { MenuClient } from "@/components/MenuClient";

export default async function Home() {
  const initialItems = await getMenuItems();
  const categories = Array.from(
    new Set(initialItems.map((item) => item.category)),
  );

  return (
    <MenuClient
      initialItems={initialItems}
      categories={categories}
    />
  );
}
