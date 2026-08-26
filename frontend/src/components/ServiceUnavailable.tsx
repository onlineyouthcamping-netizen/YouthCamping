interface ServiceUnavailableProps {
  title?: string;
  message?: string;
}

/** Layout-preserving unavailable state for temporary API failures (not 404). */
export default function ServiceUnavailable({
  title = "Temporarily unavailable",
  message = "Our booking servers are busy right now. Please try again in a few minutes.",
}: ServiceUnavailableProps) {
  return (
    <div className="bg-white min-h-[50vh] font-montserrat">
      <div className="max-w-xl mx-auto px-6 pt-28 pb-20 text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0B1528] tracking-tight">
          {title}
        </h1>
        <p className="mt-4 text-sm sm:text-base text-zinc-600 font-medium leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
