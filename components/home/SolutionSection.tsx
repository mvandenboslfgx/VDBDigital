"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";

export default function SolutionSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(198,169,93,0.06),transparent)]" />
      <div className="section-container">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading"
        >
          De oplossing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="section-title mt-2 max-w-2xl"
        >
          Eén scan. Duidelijke scores. Actiegerichte adviezen.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-6 max-w-xl text-zinc-400"
        >
          Onze AI analyseert je website op SEO, performance, gebruiksvriendelijkheid en conversie. 
          Je krijgt direct inzicht in wat er misgaat en wat je als eerste moet aanpakken—zonder jargon.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-10"
        >
          <Link href="#scan">
            <Button size="lg">Start gratis scan</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
