import { motion } from "motion/react";
import { useLang } from "@/contexts/lang-context";

export function Eco() {
  const { t } = useLang();

  return (
    <section id="impact" className="relative py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-leaf">
              {t("eco_eyebrow")}
            </div>
            <h2 className="mt-4 text-[36px] tracking-[-0.025em] leading-[1.05] md:text-[52px] text-balance">
              {t("eco_title_1")}{" "}
              <span className="font-serif italic text-leaf-soft">{t("eco_title_2")}</span>{" "}
              {t("eco_title_3")}
            </h2>
            <p className="mt-6 max-w-md text-[14px] text-muted-foreground leading-relaxed">
              {t("eco_subtitle")}
            </p>

            <ul className="mt-10 space-y-px overflow-hidden rounded-xl border hairline bg-border">
              <Stat label={t("eco_stat_weight")} value="210 KB" detail={t("eco_stat_weight_detail")} pct={91} />
              <Stat label={t("eco_stat_carbon")} value="0.08 g" detail={t("eco_stat_carbon_detail")} pct={92} />
              <Stat label={t("eco_stat_paint")} value="0.6 s" detail={t("eco_stat_paint_detail")} pct={88} />
              <Stat label={t("eco_stat_offline")} value="100%" detail={t("eco_stat_offline_detail")} pct={100} />
            </ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border hairline bg-surface p-8 shadow-soft">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span>{t("eco_tracker")}</span>
                <span className="text-leaf">{t("eco_live")}</span>
              </div>

              <div className="mt-8">
                <div className="font-serif text-[72px] leading-none text-leaf">
                  3.2<span className="text-[28px] text-muted-foreground"> tons CO₂e</span>
                </div>
                <div className="mt-2 text-[13px] text-muted-foreground">
                  {t("eco_saved")}
                </div>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 border-t hairline pt-6">
                {[
                  [t("eco_trees"), "1,420"],
                  [t("eco_volunteers"), "8,300"],
                  [t("eco_workshops"), "612"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-[20px] tracking-tight">{v}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex h-32 items-end gap-1.5">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = 30 + Math.sin(i * 0.6) * 25 + (i % 5) * 4;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.02, duration: 0.5 }}
                      className="flex-1 rounded-sm bg-leaf-gradient opacity-80"
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                <span>Mar 1</span>
                <span>Mar 28</span>
              </div>
            </div>

            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-leaf/10 blur-3xl opacity-40" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, detail, pct }: { label: string; value: string; detail: string; pct: number }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-6 bg-surface p-5">
      <div>
        <div className="text-[14px]">{label}</div>
        <div className="mt-1 text-[12px] text-muted-foreground">{detail}</div>
        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-border">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-leaf-gradient"
          />
        </div>
      </div>
      <div className="font-serif text-[26px] text-foreground leading-none">{value}</div>
    </li>
  );
}