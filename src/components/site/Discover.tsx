import { motion } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/contexts/lang-context";
import workshopImg from "@/assets/workshop.jpg";
import communityImg from "@/assets/community.jpg";

// Real ODEJ Béjaïa facility data
const items = [
  {
    tag: "Atelier",
    title: "Design numérique — cohorte #04",
    place: "Maison de Jeunes · Béjaïa",
    when: "Mar · 17:30",
    seats: "12 / 20 places",
    accent: "leaf",
  },
  {
    tag: "Bénévolat",
    title: "Nettoyage de la côte de Tichy",
    place: "Tichy · avec ODEJ Béjaïa",
    when: "Sam · 09:00",
    seats: "48 inscrits",
    accent: "amber",
  },
  {
    tag: "Bourse",
    title: "Erasmus+ mobilité courte durée",
    place: "Ouvert · 52 communes",
    when: "Clôt le 12 avr",
    seats: "Candidatures ouvertes",
    accent: "leaf",
  },
  {
    tag: "Événement",
    title: "Soirée musicale kabyle — Akbou",
    place: "Maison de Jeunes · Akbou",
    when: "Ven · 20:00",
    seats: "Entrée libre",
    accent: "amber",
  },
  {
    tag: "Formation",
    title: "Intro aux énergies renouvelables",
    place: "CSP Amizour · Béjaïa",
    when: "Lun · 4 semaines",
    seats: "Certifiée",
    accent: "leaf",
  },
  {
    tag: "Club",
    title: "Club robotique — session ouverte",
    place: "CSP Souk El Tenine",
    when: "Mer · 18:00",
    seats: "Tous niveaux",
    accent: "amber",
  },
];

export function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  function handleEventClick() {
    if (user) {
      navigate({ to: "/app" });
    } else {
      navigate({ to: "/login", search: { redirect: "/app" } });
    }
  }

  return (
    <section id="discover" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
              {t("discover_eyebrow")}
            </div>
            <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[52px] text-balance">
              {t("discover_title_1")}{" "}
              <span className="font-serif italic text-leaf-soft">{t("discover_title_2")}</span>
              {t("discover_title_3")}
            </h2>
          </div>
          <p className="max-w-sm text-[14px] text-muted-foreground leading-relaxed">
            {t("discover_subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeaturedCard image={workshopImg} onClick={handleEventClick} featuredLabel={t("discover_featured")} featuredTitle={t("discover_featured_title")} featuredSub={t("discover_featured_sub")} />
          {items.slice(0, 3).map((it, i) => (
            <Card key={i} {...it} delay={i * 0.05} onClick={handleEventClick} />
          ))}
          <SpotlightCard image={communityImg} onClick={handleEventClick} spotlightLabel={t("discover_spotlight")} spotlightQuote={t("discover_spotlight_quote")} spotlightCredit={t("discover_spotlight_credit")} />
          {items.slice(3).map((it, i) => (
            <Card key={i + 10} {...it} delay={i * 0.05} onClick={handleEventClick} />
          ))}
        </div>

        {/* Facility type summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {[
            ["9", "بيت الشباب", "AJ"],
            ["19", "مركب رياضي", "CSP"],
            ["35", "دار الشباب", "MJ"],
            ["2", "قاعات خدمات", "SPD"],
            ["2", "مخيمات", "Camp"],
            ["1", "مركز علمي", "CLS"],
          ].map(([count, ar, fr]) => (
            <div key={fr} className="rounded-xl border hairline bg-surface/50 p-4 text-center">
              <div className="text-[24px] tracking-tight text-leaf">{count}</div>
              <div className="mt-1 text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">{fr}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{ar}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Card({
  tag, title, place, when, seats, accent, delay = 0, onClick,
}: typeof items[number] & { delay?: number; onClick?: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-2xl border hairline bg-surface/50 p-6 transition-all hover:bg-surface hover:-translate-y-0.5 cursor-pointer"
    >
      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.16em]">
        <span className={accent === "leaf" ? "text-leaf" : "text-amber"}>
          {tag}
        </span>
        <span className="text-muted-foreground">{when}</span>
      </div>
      <h3 className="mt-6 text-[18px] leading-snug tracking-tight text-balance">
        {title}
      </h3>
      <div className="mt-8 flex items-end justify-between gap-3 border-t hairline pt-4">
        <div>
          <div className="text-[13px]">{place}</div>
          <div className="text-[12px] text-muted-foreground">{seats}</div>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-full border hairline transition-colors group-hover:bg-foreground group-hover:text-background">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedCard({ image, onClick, featuredLabel, featuredTitle, featuredSub }: { image: string; onClick?: () => void; featuredLabel: string; featuredTitle: string; featuredSub: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className="relative row-span-1 overflow-hidden rounded-2xl border hairline lg:row-span-1 min-h-[300px] cursor-pointer group"
    >
      <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/0" />
      <div className="relative flex h-full flex-col justify-end p-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-amber">
          {featuredLabel}
        </div>
        <h3 className="mt-3 text-[20px] tracking-tight text-balance">
          {featuredTitle}
        </h3>
        <div className="mt-3 text-[12px] text-muted-foreground">{featuredSub}</div>
        <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-mono text-amber opacity-0 group-hover:opacity-100 transition-opacity">
          Participer →
        </div>
      </div>
    </motion.article>
  );
}

function SpotlightCard({ image, onClick, spotlightLabel, spotlightQuote, spotlightCredit }: { image: string; onClick?: () => void; spotlightLabel: string; spotlightQuote: string; spotlightCredit: string }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border hairline min-h-[300px] cursor-pointer group"
    >
      <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-6">
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-leaf">
          {spotlightLabel}
        </div>
        <h3 className="mt-3 text-[20px] tracking-tight text-balance">
          {spotlightQuote}
        </h3>
        <div className="mt-3 text-[12px] text-muted-foreground">{spotlightCredit}</div>
        <div className="mt-4 inline-flex items-center gap-2 text-[12px] font-mono text-leaf opacity-0 group-hover:opacity-100 transition-opacity">
          Rejoindre →
        </div>
      </div>
    </motion.article>
  );
}