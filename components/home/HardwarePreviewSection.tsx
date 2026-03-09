"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const PRODUCTS = [
  { name: "Android 14 Smart TV Box 8K", href: "/products/android-14-tv-box", price: "€89,00 excl. btw", image: "/products/tvbox1.jpg" },
  { name: "Alle producten", href: "/products", price: "Bekijk het aanbod", image: null },
];

export default function HardwarePreviewSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-semibold text-marketing-text md:text-4xl"
        >
          Smart TV & streaming
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-lg text-marketing-textSecondary"
        >
          Kwaliteitsapparaten voor streaming en smart TV. Eenvoudig bestellen, snel geleverd.
        </motion.p>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-14 grid gap-6 sm:grid-cols-2"
        >
          {PRODUCTS.map((product) => (
            <motion.div
              key={product.href}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <Link
                href={product.href}
                className="group block rounded-2xl border border-gray-200 bg-surface p-8 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md"
              >
                <div className="aspect-video rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image src={product.image} alt={product.name} width={400} height={225} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-sm text-marketing-textSecondary">Producten bekijken</span>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-marketing-text group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-2 text-lg font-medium text-marketing-textSecondary">
                  {product.price}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-blue-600 group-hover:text-blue-700">
                  Bekijk product →
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Alle producten
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
