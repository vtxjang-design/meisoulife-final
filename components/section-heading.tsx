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

  return (
    <div className={alignment}>
      <p className="text-sm uppercase tracking-[0.3em] text-gold/90">{eyebrow}</p>
      <h2 className="mt-3.5 max-w-[13ch] whitespace-pre-line text-balance font-serif text-[30px] leading-[1.22] text-white sm:max-w-[16ch] sm:text-4xl sm:leading-[1.24]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3.5 max-w-[18ch] whitespace-pre-line text-base leading-[1.72] text-white/72 sm:max-w-[28ch] sm:text-lg sm:leading-[1.82]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
