"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { stockPhotos } from "@/lib/stock-photos";

const PRODUCTS = [
  { name: "Android 14 Smart TV Box 8K", href: "/products/android-14-tv-box", price: "€89,00 excl. btw", image: "/products/tvbox1.jpg" },
  { name: "Alle producten", href: "/products", price: "Bekijk het aanbod", image: stockPhotos.tools },
];

export default function HardwarePreviewSection() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="section-container">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl font-bold text-gray-900 md:text-5xl"
        >
          Smart TV & streaming
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-2xl text-center text-xl text-gray-500"
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
                className="group block rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex -mx-8 -mt-8 aspect-video w-[calc(100%+4rem)] items-center justify-center overflow-hidden rounded-t-xl bg-indigo-50">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={225}
                      sizes="(max-width: 640px) 100vw, 400px"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/products/placeholder.svg";
                      }}
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Producten bekijken</span>
                  )}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 transition-colors group-hover:text-indigo-600">
                  {product.name}
                </h3>
                <p className="mt-2 text-base font-medium text-gray-500">
                  {product.price}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-indigo-600 group-hover:text-indigo-700">
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
          <Link href="/products" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-medium text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95">
            Alle producten
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
