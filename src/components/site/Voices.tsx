import { useLang } from "@/contexts/lang-context";

export function Voices() {
  const { t } = useLang();

  const voices = [
    { quote: t("voices_q1"), name: t("voices_p1"), place: t("voices_l1") },
    { quote: t("voices_q2"), name: t("voices_p2"), place: t("voices_l2") },
    { quote: t("voices_q3"), name: t("voices_p3"), place: t("voices_l3") },
  ];

  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
              {t("voices_eyebrow")}
            </div>
            <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[48px] text-balance">
              {t("voices_title_1")}{" "}
              <span className="font-serif italic">{t("voices_title_2")}</span>{" "}
              {t("voices_title_3")}{" "}
              <span className="font-serif italic">{t("voices_title_4")}</span>.
            </h2>
            <p className="mt-4 text-[13px] text-muted-foreground leading-relaxed">
              {t("voices_subtitle")}
            </p>
          </div>

          <div className="space-y-px overflow-hidden rounded-2xl border hairline bg-border">
            {voices.map((v, i) => (
              <figure key={i} className="bg-background p-8 md:p-10">
                <blockquote className="text-[22px] leading-snug tracking-tight text-balance md:text-[26px]">
                  <span className="font-serif text-leaf text-[28px] mr-1 align-[-4px]">"</span>
                  {v.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 text-[12px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  <span className="h-px w-8 bg-leaf" />
                  {v.name} · {v.place}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}