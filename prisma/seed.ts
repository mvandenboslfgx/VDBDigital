import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { name: "free", price: 0, credits: 1, features: { auditsPerMonth: 1, aiTools: false } },
    { name: "starter", price: 2900, credits: 25, features: { auditsPerMonth: 25, aiTools: true } },
    { name: "growth", price: 7900, credits: 150, features: { auditsPerMonth: 150, aiTools: true } },
    { name: "agency", price: 19900, credits: 500, features: { auditsPerMonth: 500, aiTools: true } },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { name: p.name },
      create: {
        name: p.name,
        price: p.price,
        credits: p.credits,
        features: p.features,
        active: true,
      },
      update: {
        price: p.price,
        credits: p.credits,
        features: p.features,
      },
    });
  }

  console.log("Seed: Plans (free, starter, growth, agency) created/updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
