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

  // Android 14 Smart TV Box 8K
  await prisma.product.upsert({
    where: { slug: "android-14-tv-box" },
    create: {
      name: "Android 14 Smart TV Box 8K",
      slug: "android-14-tv-box",
      description:
        "Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor apps zoals Netflix, YouTube en IPTV. Verander elke televisie in een slimme entertainment hub.",
      shortDescription:
        "Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor apps zoals Netflix, YouTube en IPTV.",
      price: 89,
      images: ["/products/tvbox1.jpg", "/products/tvbox2.jpg", "/products/tvbox3.jpg", "/products/tvbox4.jpg"],
      stock: 50,
      category: "Apparaten",
      specifications: {
        "Operating system": "Android 14",
        Video: "8K Ultra HD",
        WiFi: "Dual band",
        Bluetooth: "5.0",
        Ports: "HDMI, USB, Ethernet",
      },
      metaTitle: "Android 14 Smart TV Box 8K | Streaming TV Box kopen | VDB Digital",
      metaDescription:
        "Krachtige Android 14 TV Box met 8K ondersteuning en snelle WiFi. Perfect voor Netflix, YouTube en IPTV. Nu verkrijgbaar voor €89 excl. btw.",
    },
    update: {
      name: "Android 14 Smart TV Box 8K",
      description:
        "Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor apps zoals Netflix, YouTube en IPTV. Verander elke televisie in een slimme entertainment hub.",
      shortDescription:
        "Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor apps zoals Netflix, YouTube en IPTV.",
      price: 89,
      images: ["/products/tvbox1.jpg", "/products/tvbox2.jpg", "/products/tvbox3.jpg", "/products/tvbox4.jpg"],
      stock: 50,
      category: "Apparaten",
      specifications: {
        "Operating system": "Android 14",
        Video: "8K Ultra HD",
        WiFi: "Dual band",
        Bluetooth: "5.0",
        Ports: "HDMI, USB, Ethernet",
      },
      metaTitle: "Android 14 Smart TV Box 8K | Streaming TV Box kopen | VDB Digital",
      metaDescription:
        "Krachtige Android 14 TV Box met 8K ondersteuning en snelle WiFi. Perfect voor Netflix, YouTube en IPTV. Nu verkrijgbaar voor €89 excl. btw.",
    },
  });

  console.log("Seed: Android 14 Smart TV Box 8K created/updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
