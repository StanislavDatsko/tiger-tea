export const categories = ["Чаї", "Bubble Tea", "Десерти"] as const;

export type MenuCategory = (typeof categories)[number];

export type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: number;
  image: string;
};

export const menuItems: MenuItem[] = [
  {
    id: "oolong-milk-tea",
    category: "Чаї",
    name: "Молочний улун",
    description: "Насичений улун з вершковим молоком та легкою карамеллю.",
    price: 89,
    image: "/placeholder.png",
  },
  {
    id: "jasmine-green",
    category: "Чаї",
    name: "Жасминовий зелений",
    description: "Ніжний зелений чай з ароматом жасмину, подається холодним або гарячим.",
    price: 75,
    image: "/placeholder.png",
  },
  {
    id: "classic-bubble-milk",
    category: "Bubble Tea",
    name: "Класичне bubble milk tea",
    description: "Чорний чай, молоко та тапіока — фірмова класика Tiger Tea.",
    price: 95,
    image: "/placeholder.png",
  },
  {
    id: "taro-bubble",
    category: "Bubble Tea",
    name: "Таро bubble tea",
    description: "Кремовий смак таро, молоко та жувальні кульки тапіоки.",
    price: 105,
    image: "/placeholder.png",
  },
  {
    id: "mango-cheese-foam",
    category: "Bubble Tea",
    name: "Манго з сирною пінкою",
    description: "Фруктовий мікс манго, лід та солона сирна пінка зверху.",
    price: 115,
    image: "/placeholder.png",
  },
  {
    id: "mochi-set",
    category: "Десерти",
    name: "Мочі асорті",
    description: "Три шматочки мочі з різними начинками — ідеально до напою.",
    price: 120,
    image: "/placeholder.png",
  },
];
