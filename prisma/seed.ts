import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  // Idempotent: safe to run on every deploy/build without duplicating rows.
  const existing = await prisma.contractor.count();
  if (existing > 0) {
    console.log(`Skipping seed — ${existing} contractor(s) already exist.`);
    return;
  }

  const contractors = [
    { name: "Al-Faisal Electrical Services", trade: "Electrical", city: "Jeddah", phone: "0555000001" },
    { name: "Noor Electric Est.", trade: "Electrical", city: "Jeddah", phone: "0555000002" },
    { name: "Jeddah Plumbing Pros", trade: "Plumbing", city: "Jeddah", phone: "0555000003" },
    { name: "Al-Amin Sanitary Works", trade: "Plumbing", city: "Jeddah", phone: "0555000004" },
    { name: "CoolBreeze HVAC Co.", trade: "HVAC", city: "Jeddah", phone: "0555000005" },
    { name: "Gulf AC Maintenance", trade: "HVAC", city: "Jeddah", phone: "0555000006" },
    { name: "Modern Finishes Co.", trade: "Civil Finishes", city: "Jeddah", phone: "0555000007" },
  ];

  for (const c of contractors) {
    await prisma.contractor.create({ data: c });
  }

  console.log(`Seeded ${contractors.length} contractors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
