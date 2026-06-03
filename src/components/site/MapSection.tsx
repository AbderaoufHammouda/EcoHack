import { motion } from "motion/react";
import mapImg from "@/assets/map.jpg";

// Key communes of Béjaïa wilaya with facility counts from ODEJ data
const COMMUNES = [
  { name: "بجاية", nameF: "Béjaïa", x: "54%", y: "16%", count: 12 },
  { name: "تيشي", nameF: "Tichy", x: "66%", y: "10%", count: 4 },
  { name: "درقينة", nameF: "Darguina", x: "77%", y: "22%", count: 3 },
  { name: "سوق الإثنين", nameF: "Souk El Tenine", x: "82%", y: "32%", count: 5 },
  { name: "أميزور", nameF: "Amizour", x: "40%", y: "30%", count: 4 },
  { name: "أقبو", nameF: "Akbou", x: "24%", y: "44%", count: 5 },
  { name: "أوزلاقن", nameF: "Ouzellaguen", x: "44%", y: "54%", count: 3 },
  { name: "خراطة", nameF: "Kherrata", x: "74%", y: "58%", count: 4 },
  { name: "تازمالت", nameF: "Tazmalt", x: "18%", y: "60%", count: 3 },
  { name: "إغزر أمقران", nameF: "Ighzer Amokrane", x: "56%", y: "67%", count: 3 },
];

export function MapSection() {
  return (
    <section id="map" className="relative py-28 md:py-36 border-y hairline bg-surface/40">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
              02 — Carte · ⵜⴰⵏⴰⴹⵜ
            </div>
            <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[52px] text-balance">
              Chaque{" "}
              <span className="font-serif italic">Maison de Jeunes</span>,
              sur une carte calme — بجاية.
            </h2>
            <p className="mt-6 max-w-md text-[14px] text-muted-foreground leading-relaxed">
              Trouvez la structure la plus proche de chez vous dans la
              wilaya de Béjaïa. Filtrez par commune, par type d'activité,
              par ce qui est ouvert ce soir. Fonctionne hors ligne dès la
              première visite.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border hairline bg-border">
              {[
                ["68", "Structures ODEJ"],
                ["52 / 52", "Communes couvertes"],
                ["210 KB", "Poids moyen / page"],
                ["Hors ligne", "Après la 1ʳᵉ visite"],
              ].map(([v, l]) => (
                <div key={l} className="bg-surface p-5">
                  <div className="text-[22px] tracking-tight">{v}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{l}</div>
                </div>
              ))}
            </div>

            {/* Facility type legend */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                ["بيت الشباب", "AJ", "leaf"],
                ["مركب رياضي", "CSP", "amber"],
                ["دار الشباب", "MJ", "leaf"],
                ["مخيمات", "Camp", "amber"],
              ].map(([ar, fr, color]) => (
                <div key={fr} className="flex items-center gap-1.5 text-[11px] font-mono">
                  <span className={`h-1.5 w-1.5 rounded-full ${color === "leaf" ? "bg-leaf" : "bg-amber"}`} />
                  <span className="text-muted-foreground">{fr}</span>
                  <span className="text-muted-foreground opacity-50">·</span>
                  <span className="text-foreground/70">{ar}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border hairline shadow-soft">
            <img
              src={mapImg}
              alt="Carte de la wilaya de Béjaïa avec les structures ODEJ"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-transparent to-background/70" />

            {COMMUNES.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                style={{ left: c.x, top: c.y }}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className="block h-2 w-2 rounded-full bg-leaf shadow-[0_0_0_4px_oklch(0.78_0.14_155/0.18)]" />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border hairline bg-background/90 px-2 py-1 text-[10px] font-mono opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  {c.nameF} · {c.count} structures
                </div>
              </motion.div>
            ))}

            {/* live pulse on Béjaïa city */}
            <motion.span
              className="absolute h-3 w-3 rounded-full bg-amber/80"
              style={{ left: "54%", top: "16%" }}
              animate={{ scale: [1, 2.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />

            <div className="absolute bottom-4 left-4 rounded-lg border hairline bg-background/80 px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              En direct · Béjaïa · 9 nouvelles ce soir
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}