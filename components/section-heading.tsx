type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";
  const textAlignment = align === "center" ? "mx-auto" : "";

  return (
    <div className={alignment}>
      <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{eyebrow}</p>
      <h2 className={`word-balance keep-phrase hero-measure mt-3.5 whitespace-pre-line font-serif text-[clamp(1.75rem,7vw,3rem)] leading-[1.2] text-white ${textAlignment}`}>
        {title}
      </h2>
      {description ? (
        <p className={`body-measure word-balance keep-phrase mt-3.5 whitespace-pre-line text-[clamp(1rem,4vw,1.25rem)] leading-[1.75] text-white/72 ${textAlignment}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
