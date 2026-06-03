import { motion } from "motion/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/auth-context";
import { useLang } from "@/contexts/lang-context";
import heroImg from "@/assets/hero.jpg";

function greeting(): { fr: string; ar: string; ber: string; period: string } {
  const h = new Date().getHours();
  if (h < 12) return { fr: "Bonjour", ar: "صباح الخير", ber: "Azul", period: "morning" };
  if (h < 18) return { fr: "Bon après-midi", ar: "مساء الخير", ber: "Azul", period: "afternoon" };
  return { fr: "Bonsoir", ar: "تصبح على خير", ber: "Azul", period: "evening" };
}

export function Hero() {
  const g = greeting();
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
    <section className="relative isolate overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-leaf/30 to-transparent" />

      <div className="relative mx-auto max-w-[1240px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
          <span className="uppercase tracking-[0.18em]">{t("hero_eyebrow")}</span>
          <span className="opacity-40">/</span>
          <span className="opacity-70">{g.fr} · {g.ar} · {g.ber}</span>
        </motion.div>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="text-balance text-[44px] leading-[1.02] tracking-[-0.03em] sm:text-[64px] md:text-[80px]"
            >
              {t("hero_title_1")}
              <br />
              {t("hero_title_2")}{" "}
              <span className="font-serif italic text-leaf">{t("hero_title_3")}</span>
              <br />
              {t("hero_title_4")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.18 }}
              className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground md:text-base"
            >
              {t("hero_subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={handleEventClick}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-medium text-background transition-all hover:gap-3"
              >
                {t("hero_cta_explore")}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
              <Link
                to="/login"
                search={{ redirect: "/app" }}
                className="inline-flex h-11 items-center rounded-full border hairline bg-surface/40 px-5 text-[14px] text-foreground/90 backdrop-blur transition-colors hover:bg-surface"
              >
                {t("hero_cta_login")}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-12 flex flex-wrap gap-x-10 gap-y-4 text-[12px] font-mono uppercase tracking-[0.15em] text-muted-foreground"
            >
              <Metric value="68" label={t("hero_metric_structures")} />
              <Metric value="52" label={t("hero_metric_communes")} />
              <Metric value="89%" label={t("hero_metric_data")} />
              <Metric value="ODEJ" label={t("hero_metric_partner")} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border hairline shadow-soft">
              <img
                src={heroImg}
                alt="Jeunes Bejaouis réunis dans un espace communautaire"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />

              {/* Floating live card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="absolute left-4 right-4 bottom-4 rounded-xl border hairline bg-background/80 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-leaf">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
                  {t("hero_live")}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[15px] tracking-tight">{t("hero_live_event")}</div>
                    <div className="text-[12px] text-muted-foreground">{t("hero_live_sub")}</div>
                  </div>
                  <button
                    onClick={handleEventClick}
                    className="shrink-0 h-8 rounded-full bg-leaf-gradient px-3 text-[11px] font-medium text-background hover:opacity-90 transition-opacity"
                  >
                    {t("hero_live_btn")}
                  </button>
                </div>
              </motion.div>
            </div>

            <div className="pointer-events-none absolute -inset-12 -z-10 rounded-[3rem] bg-leaf/10 blur-3xl opacity-40 animate-drift" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-sans text-[22px] text-foreground tracking-tight normal-case">
        {value}
      </div>
      <div className="mt-0.5">{label}</div>
    </div>
  );
}