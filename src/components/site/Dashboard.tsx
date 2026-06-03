import { motion } from "motion/react";

export function Dashboard() {
  return (
    <section id="dashboard" className="relative py-28 md:py-36 border-y hairline bg-surface/40">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="max-w-2xl">
          <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
            04 — Pour le personnel ODEJ Béjaïa
          </div>
          <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[52px] text-balance">
            Un tableau de bord qui{" "}
            <span className="font-serif italic text-leaf-soft">respecte</span>{" "}
            les responsables de structures.
          </h2>
          <p className="mt-6 text-[14px] text-muted-foreground leading-relaxed">
            Pas de tableaux Excel, pas de jargon. Ajoutez un événement en
            30 secondes, envoyez une annonce à votre commune, uploadez une
            affiche. C'est tout.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative mt-16 overflow-hidden rounded-2xl border hairline bg-background shadow-soft"
        >
          {/* window chrome */}
          <div className="flex items-center justify-between border-b hairline bg-surface px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
            </div>
            <div className="rounded-md border hairline bg-background px-3 py-1 text-[11px] font-mono text-muted-foreground">
              admin.youthlink.dz / evenements
            </div>
            <div className="text-[11px] font-mono text-muted-foreground hidden sm:block">
              MJ Béjaïa · Fatima Ramtani
            </div>
          </div>

          <div className="grid grid-cols-[200px_1fr] min-h-[460px]">
            {/* sidebar */}
            <aside className="hidden sm:block border-r hairline p-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3 px-2">
                Ma structure
              </div>
              {[
                ["Vue d'ensemble", false],
                ["Événements", true],
                ["Activités", false],
                ["Membres", false],
                ["Annonces", false],
                ["Paramètres", false],
              ].map(([name, active]) => (
                <div
                  key={name as string}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] ${
                    active ? "bg-surface text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-leaf" : "bg-border"}`} />
                  {name}
                </div>
              ))}

              <div className="mt-8 rounded-lg border hairline p-3">
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-leaf">
                  Cette semaine
                </div>
                <div className="mt-2 text-[22px] tracking-tight">8 événements</div>
                <div className="text-[11px] text-muted-foreground">+2 vs. semaine passée</div>
              </div>
            </aside>

            {/* main */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    Événements · Juin
                  </div>
                  <div className="mt-1 text-[22px] tracking-tight">À venir cette semaine</div>
                </div>
                <button className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-[12px] font-medium text-background">
                  <span className="text-[14px] leading-none">+</span> Nouvel événement
                </button>
              </div>

              <div className="mt-6 space-y-2">
                {[
                  ["Atelier · Design d'impact", "Sam 18:00", "12 / 20", "leaf"],
                  ["Soirée musicale kabyle", "Ven 20:00", "Gratuit", "amber"],
                  ["Robotique — session ouverte", "Mer 18:00", "Tous niveaux", "leaf"],
                  ["Briefing bénévoles · Tichy", "Dim 09:00", "48 inscrits", "amber"],
                ].map(([t, w, s, a], i) => (
                  <motion.div
                    key={t}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 rounded-lg border hairline bg-surface/60 px-4 py-3 hover:bg-surface transition-colors"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${a === "leaf" ? "bg-leaf" : "bg-amber"}`} />
                    <div className="text-[14px]">{t}</div>
                    <div className="text-[12px] font-mono text-muted-foreground">{w}</div>
                    <div className="text-[12px] text-muted-foreground">{s}</div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ["Portée ce mois", "4 200"],
                  ["Bénévoles actifs", "138"],
                  ["Affiches programmées", "5"],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-lg border hairline bg-surface/60 p-4">
                    <div className="text-[20px] tracking-tight">{v}</div>
                    <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mt-1">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}