import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { prisma } from "../src/lib/prisma";

type CatalogAccessory = {
  name: string;
  order: number;
  lowBrand: string;
  lowPrice: number;
  mediumBrand: string;
  mediumPrice: number;
  highBrand: string;
  highPrice: number;
  laborFee: number;
};
type CatalogSubcategory = { name: string; order: number; accessories: CatalogAccessory[] };
type CatalogCategory = {
  name: string;
  icon: string;
  gradient: string;
  order: number;
  subcategories: CatalogSubcategory[];
};

async function seedCatalog() {
  const existing = await prisma.serviceCategory.count();
  if (existing > 0) {
    console.log(`Skipping catalog seed — ${existing} categor(y/ies) already exist.`);
    return;
  }

  const raw = readFileSync(path.join(__dirname, "data/catalog.json"), "utf-8");
  const catalog: CatalogCategory[] = JSON.parse(raw);

  let accessoryCount = 0;
  for (const cat of catalog) {
    const category = await prisma.serviceCategory.create({
      data: { name: cat.name, icon: cat.icon, gradient: cat.gradient, sortOrder: cat.order },
    });
    for (const sub of cat.subcategories) {
      const subcategory = await prisma.serviceSubcategory.create({
        data: { name: sub.name, sortOrder: sub.order, categoryId: category.id },
      });
      await prisma.serviceAccessory.createMany({
        data: sub.accessories.map((a) => ({
          name: a.name,
          sortOrder: a.order,
          subcategoryId: subcategory.id,
          lowBrand: a.lowBrand,
          lowPrice: a.lowPrice,
          mediumBrand: a.mediumBrand,
          mediumPrice: a.mediumPrice,
          highBrand: a.highBrand,
          highPrice: a.highPrice,
          laborFee: a.laborFee,
        })),
      });
      accessoryCount += sub.accessories.length;
    }
  }

  console.log(
    `Seeded ${catalog.length} categories, ${catalog.reduce((n, c) => n + c.subcategories.length, 0)} subcategories, ${accessoryCount} accessories.`
  );
}

async function seedContractors() {
  const existing = await prisma.contractor.count();
  if (existing > 0) {
    console.log(`Skipping contractor seed — ${existing} contractor(s) already exist.`);
    return;
  }

  const contractors = [
    { name: "Al-Faisal Electrical Services", category: "Electrical", city: "Jeddah", phone: "0555000001" },
    { name: "Noor Electric Est.", category: "Electrical", city: "Jeddah", phone: "0555000002" },
    { name: "Jeddah Plumbing Pros", category: "Sanitary Fixtures", city: "Jeddah", phone: "0555000003" },
    { name: "Al-Amin Sanitary Works", category: "Sanitary Fixtures", city: "Jeddah", phone: "0555000004" },
    { name: "Modern Hardware & Fire Safety Co.", category: "Mechanical Fixtures", city: "Jeddah", phone: "0555000007" },
    { name: "CoolBreeze Window AC Services", category: "Window AC", city: "Jeddah", phone: "0555000005" },
    { name: "Gulf Split AC Maintenance", category: "Split AC", city: "Jeddah", phone: "0555000006" },
    { name: "Jeddah Appliance Repair Co.", category: "Washing Machine", city: "Jeddah", phone: "0555000008" },
  ];

  for (const c of contractors) {
    await prisma.contractor.create({ data: c });
  }

  console.log(`Seeded ${contractors.length} contractors.`);
}

async function main() {
  await seedCatalog();
  await seedContractors();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
