"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EmailGatePopupProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string, name: string) => void;
  loading?: boolean;
}

export default function EmailGatePopup({
  open,
  onClose,
  onSubmit,
  loading = false,
}: EmailGatePopupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Vul een geldig e-mailadres in.");
      return;
    }
    setError("");
    onSubmit(trimmed, name.trim());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !loading) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Ontgrendel het volledige rapport
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Vul je e-mail in en ontvang direct alle aanbevelingen, technische details en AI-advies.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="gate-email" className="text-sm font-medium text-gray-700">
                  E-mailadres *
                </label>
                <input
                  ref={inputRef}
                  id="gate-email"
                  type="email"
                  required
                  placeholder="je@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                />
              </div>
              <div>
                <label htmlFor="gate-name" className="text-sm font-medium text-gray-700">
                  Naam <span className="text-gray-400">(optioneel)</span>
                </label>
                <input
                  id="gate-name"
                  type="text"
                  placeholder="Jan Jansen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-medium text-white shadow-lg transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Rapport ophalen..." : "Ontgrendel rapport"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              Geen spam. Je gegevens worden alleen voor dit rapport gebruikt.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
