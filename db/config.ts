import { defineDb, defineTable, column, NOW } from 'astro:db';

const Images = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    url: column.text(),
    alt: column.text(),
    tag: column.text({ optional: true }),
    observation: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

const Categories = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    description: column.text(),
    image: column.number({ references: () => Images.columns.id }),
    featured: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

const Products = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    name: column.text(),
    price: column.number(),
    description: column.text(),
    image: column.number({ references: () => Images.columns.id }),
    category: column.number({ references: () => Categories.columns.id }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Categories,
    Products,
    Images,
  },
});
