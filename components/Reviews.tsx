"use client";

import { useEffect, useState } from "react";

type Review = {
  id: string;
  name: string;
  rating: number;
  content: string;
  createdAt: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  reviews?: Review[];
};

const Stars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, idx) => (
        <span
          key={idx}
          className={
            idx < rating ? "text-gold text-sm" : "text-gray-700 text-sm"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewsSkeleton = () => (
  <div className="mt-8 grid gap-4 md:grid-cols-3">
    {Array.from({ length: 3 }).map((_, idx) => (
      <div
        key={idx}
        className="rounded-2xl border border-white/5 bg-black/60 p-4 animate-pulse"
      >
        <div className="h-4 w-24 rounded bg-gray-800" />
        <div className="mt-2 h-3 w-32 rounded bg-gray-800" />
        <div className="mt-4 h-3 w-full rounded bg-gray-800" />
        <div className="mt-2 h-3 w-5/6 rounded bg-gray-800" />
      </div>
    ))}
  </div>
);

export const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [botField, setBotField] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/review");
        const data = (await res.json()) as ApiResponse;
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rating,
          content,
          botField,
        }),
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }
      setFeedback({ type: "success", message: data.message });
      setName("");
      setRating(5);
      setContent("");
      setBotField("");
      // Refresh reviews
      const refreshed = await fetch("/api/review");
      const refreshedData = (await refreshed.json()) as ApiResponse;
      if (refreshedData.success && refreshedData.reviews) {
        setReviews(refreshedData.reviews);
      }
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We konden je review niet opslaan. Probeer het nog een keer.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-32">
      <div className="section-container">
        <div className="text-center max-w-2xl mx-auto">
          <p className="section-heading">Reviews</p>
          <h2 className="section-title">Wat onze klanten zeggen.</h2>
          <p className="mt-4 text-sm sm:text-base text-gray-300/90">
            Elk traject wordt bewust beperkt zodat we dicht bij het werk en het
            resultaat kunnen blijven. Zo voelt dat aan de andere kant van de
            launch.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="btn-ghost mt-6"
          >
            Laat een review achter
          </button>
        </div>

        {loading ? (
          <ReviewsSkeleton />
        ) : reviews.length === 0 ? (
          <p className="mt-8 text-sm text-gray-400">
            Reviews verschijnen hier zodra klanten hun ervaringen delen.
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-white/10 bg-black/60 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.9)]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    {review.name}
                  </h3>
                  <Stars rating={review.rating} />
                </div>
                <p className="mt-3 text-sm text-gray-300 line-clamp-5">
                  {review.content}
                </p>
                <p className="mt-4 text-[11px] text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6 shadow-[0_22px_55px_rgba(0,0,0,0.95)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Review achterlaten
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFeedback(null);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-200"
                >
                  Sluiten
                </button>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <input
                  type="text"
                  name="botField"
                  value={botField}
                  onChange={(e) => setBotField(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Naam
                  </label>
                  <input
                    className="input-base mt-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Beoordeling
                  </label>
                  <select
                    className="input-base mt-1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} sterren
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300">
                    Review
                  </label>
                  <textarea
                    className="input-base mt-1 min-h-[100px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full"
                >
                  {submitting ? "Bezig met verzenden..." : "Review versturen"}
                </button>
                {feedback && (
                  <p
                    className={
                      feedback.type === "success"
                        ? "success-text"
                        : "error-text"
                    }
                  >
                    {feedback.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;

