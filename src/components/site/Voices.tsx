const voices = [
  {
    quote:
      "J'ai trouvé un atelier de code à deux rues de chez moi à Amizour. Je ne savais même pas qu'il existait.",
    name: "Massinissa, 20 ans",
    place: "Amizour · Béjaïa",
  },
  {
    quote:
      "On a posté un nettoyage de côte vendredi. Le dimanche, 90 personnes s'étaient inscrites — sans aucune pub.",
    name: "Lila, personnel ODEJ",
    place: "Tichy · Béjaïa",
  },
  {
    quote:
      "Enfin quelque chose en arabe, français et tamazight qui ne ressemble pas à un formulaire administratif.",
    name: "Yidir, 22 ans",
    place: "Akbou · Béjaïa",
  },
];

export function Voices() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
              05 — Voix · ⵉⵙⴻⵍⵍⴰⵙⴻⵏ
            </div>
            <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[48px] text-balance">
              De{" "}
              <span className="font-serif italic">Béjaïa</span> à{" "}
              <span className="font-serif italic">Kherrata</span>.
            </h2>
            <p className="mt-4 text-[13px] text-muted-foreground leading-relaxed">
              Des voix de la wilaya — en arabe, en français, en tamazight.
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