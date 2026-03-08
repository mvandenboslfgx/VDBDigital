"use client";

interface ShareButtonsProps {
  shareUrl: string;
  domain: string;
  score: number;
}

export function ShareButtons({ shareUrl, domain, score }: ShareButtonsProps) {
  const text = `Mijn website ${domain} scoort ${score}/100 op de audit. Bekijk het rapport:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <span className="text-sm text-zinc-500">Deel:</span>
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Deel op Twitter / X"
      >
        Twitter / X
      </a>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Deel op LinkedIn"
      >
        LinkedIn
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Kopieer rapportlink"
      >
        Link kopiëren
      </button>
    </div>
  );
}
