export function Footer() {
  return (
    <footer className="relative border-t hairline">
      <div className="mx-auto max-w-[1240px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-leaf-gradient shadow-leaf">
                <span className="h-2 w-2 rounded-full bg-background" />
              </span>
              <span className="text-[15px] tracking-tight">
                YouthLink<span className="text-leaf">.</span>bejaia
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[13px] text-muted-foreground leading-relaxed">
              Construit avec soin pour la jeunesse des 52 communes de la
              wilaya de Béjaïa, en partenariat avec ODEJ — Office des
              Établissements de Jeunes de Béjaïa.
            </p>
            <div className="mt-6 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf animate-pulse" />
              ECOHACK Béjaïa 2026
            </div>
          </div>

          <FooterCol title="Produit" links={["Découvrir", "Carte", "Éco-impact", "Tableau de bord"]} />
          <FooterCol title="ODEJ Béjaïa" links={["Pour le personnel", "Structures", "Partenaires", "Contact"]} />
          <FooterCol title="Langues" links={["العربية", "Français", "ⵜⴰⵎⴰⵣⵉⵖⵜ"]} />
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t hairline pt-6 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>© 2026 YouthLink Béjaïa · Un projet civique</div>
          <div className="flex items-center gap-6">
            <span>210 KB / page</span>
            <span>0.08 g CO₂ / visite</span>
            <span className="text-leaf">fabriqué à Béjaïa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-4 space-y-2.5 text-[13px]">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}