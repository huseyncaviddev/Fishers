"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="font-display text-7xl sm:text-9xl font-bold text-ocean/20">
          Xəta
        </h1>
        <h2 className="mt-4 font-display text-2xl sm:text-3xl font-bold text-navy">
          Gözlənilməz Xəta
        </h2>
        <p className="mt-3 text-slate/60 text-base leading-relaxed">
          Bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.
        </p>
        <button onClick={reset} className="btn btn-primary mt-8 inline-flex">
          <span>Yenidən Cəhd Et</span>
        </button>
      </div>
    </section>
  );
}
