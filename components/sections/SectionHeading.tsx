type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "split" | "center";
  id?: string;
};

export default function SectionHeading({ eyebrow, title, intro, tone = "light", align = "split", id }: Props) {
  const dark = tone === "dark";
  if (align === "center") {
    return (
      <header className="mx-auto max-w-3xl text-center">
        <p data-reveal className={`eyebrow ${dark ? "text-accent" : "text-accent-deep"}`}>
          {eyebrow}
        </p>
        <h2 id={id} data-reveal style={{ "--reveal-delay": 120 } as React.CSSProperties} className={`display mt-6 text-balance text-[clamp(2.4rem,5.4vw,4.75rem)] ${dark ? "" : "text-navy"}`}>
          {title}
        </h2>
        {intro && (
          <p data-reveal style={{ "--reveal-delay": 220 } as React.CSSProperties} className={`mx-auto mt-6 max-w-xl text-[1.05rem] leading-relaxed ${dark ? "text-ivory/70" : "text-stone"}`}>
            {intro}
          </p>
        )}
      </header>
    );
  }
  return (
    <header className="grid gap-8 md:grid-cols-12 md:items-end">
      <div className="md:col-span-7">
        <p data-reveal className={`eyebrow ${dark ? "text-accent" : "text-accent-deep"}`}>
          {eyebrow}
        </p>
        <h2 id={id} data-reveal style={{ "--reveal-delay": 120 } as React.CSSProperties} className={`display mt-6 text-balance text-[clamp(2.4rem,5.4vw,4.75rem)] ${dark ? "" : "text-navy"}`}>
          {title}
        </h2>
      </div>
      {intro && (
        <p
          data-reveal
          style={{ "--reveal-delay": 240 } as React.CSSProperties}
          className={`text-[1.05rem] leading-relaxed md:col-span-4 md:col-start-9 md:pb-3 ${dark ? "text-ivory/70" : "text-stone"}`}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
