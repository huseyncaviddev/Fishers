import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="font-display text-7xl sm:text-9xl font-bold text-ocean/20">
          404
        </h1>
        <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-navy">
          Səhifə Tapılmadı
        </h2>
        <p className="mt-3 text-slate/60 text-base leading-relaxed">
          Axtardığınız səhifə mövcud deyil və ya köçürülmüşdür.
        </p>
        <Link href="/" className="btn btn-primary mt-8 inline-flex">
          <span>Ana Səhifəyə Qayıt</span>
          <svg
            className="w-4 h-4 btn-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
