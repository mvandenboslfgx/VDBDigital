"use client";

import { motion } from "framer-motion";
import type { FunnelGeneratorResult } from "../types";

type Props = { result: FunnelGeneratorResult };

export function FunnelResult({ result }: Props) {
  const { landingPageStructure, offerIdea, emailFunnel, adIdeas } = result;

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-black/80 p-6 lg:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        Funnel-overzicht
      </p>

      {landingPageStructure?.headline && (
        <div>
          <h3 className="text-sm font-semibold text-white">Landingspagina</h3>
          <p className="mt-1 text-sm font-medium text-gold">{landingPageStructure.headline}</p>
          {landingPageStructure.subheadline && (
            <p className="mt-1 text-xs text-gray-300">{landingPageStructure.subheadline}</p>
          )}
          {landingPageStructure.sections?.length > 0 && (
            <ul className="mt-3 space-y-2">
              {landingPageStructure.sections.map((s, i) => (
                <li key={i} className="rounded-xl border border-white/10 bg-black/60 p-3 text-[11px]">
                  <span className="font-semibold text-gray-100">{s.title}</span>
                  <span className="text-gray-400"> — {s.description}</span>
                </li>
              ))}
            </ul>
          )}
          {landingPageStructure.cta && (
            <p className="mt-2 text-xs text-gold">CTA: {landingPageStructure.cta}</p>
          )}
        </div>
      )}

      {offerIdea?.title && (
        <div>
          <h3 className="text-sm font-semibold text-white">Offer-idee</h3>
          <p className="mt-1 text-sm text-gray-200">{offerIdea.title}</p>
          {offerIdea.description && (
            <p className="mt-1 text-xs text-gray-400">{offerIdea.description}</p>
          )}
          {offerIdea.leadMagnet && (
            <p className="mt-1 text-[11px] text-gold">Lead magnet: {offerIdea.leadMagnet}</p>
          )}
        </div>
      )}

      {emailFunnel?.subjectLines?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">E-mailfunnel</h3>
          <p className="text-[11px] text-gray-400 mt-1">Onderwerpregels:</p>
          <ul className="mt-1 list-disc list-inside text-xs text-gray-300">
            {emailFunnel.subjectLines.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {emailFunnel.sequenceSteps?.length > 0 && (
            <>
              <p className="text-[11px] text-gray-400 mt-2">Stappen:</p>
              <ul className="mt-1 list-disc list-inside text-xs text-gray-300">
                {emailFunnel.sequenceSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {adIdeas?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white">Ad-ideeën</h3>
          <ul className="mt-2 space-y-1 text-xs text-gray-300">
            {adIdeas.map((a, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gold/80">•</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FunnelResult;
