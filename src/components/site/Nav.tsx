import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, type Lang } from "@/contexts/lang-context";

const LANGS: { code: Lang; label: string }[] = [
  { code: "FR", label: "FR" },
  { code: "AR", label: "AR" },
  { code: "TZM", label: "Kabyle" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b hairline"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative grid h-7 w-7 place-items-center rounded-md bg-leaf-gradient shadow-leaf">
            <span className="h-2 w-2 rounded-full bg-background" />
          </span>
          <span className="text-[15px] font-medium tracking-tight">
            YouthLink<span className="text-leaf">.</span>bejaia
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] text-muted-foreground">
          <a href="#discover" className="hover:text-foreground transition-colors">{t("nav_discover")}</a>
          <a href="#map" className="hover:text-foreground transition-colors">{t("nav_map")}</a>
          <a href="#impact" className="hover:text-foreground transition-colors">{t("nav_eco")}</a>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex h-8 items-center rounded-full border hairline bg-surface/60 p-0.5 text-[11px] font-mono">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`h-7 min-w-[28px] rounded-full px-2 transition-colors ${
                  lang === code
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === "admin" ? "/admin" : "/app"}
                id="nav-dashboard"
                className="h-9 inline-flex items-center rounded-full bg-leaf-gradient px-4 text-[13px] font-medium text-background hover:opacity-90 transition-opacity"
              >
                {user.role === "admin" ? t("nav_admin") : t("nav_myspace")}
              </Link>
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="h-9 inline-flex items-center rounded-full border hairline bg-surface/40 px-4 text-[13px] text-foreground/90 hover:bg-surface transition-colors"
              >
                {t("nav_logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                id="nav-login"
                className="h-9 inline-flex items-center rounded-full border hairline bg-surface/40 px-4 text-[13px] text-foreground/90 backdrop-blur transition-colors hover:bg-surface"
              >
                {t("nav_login")}
              </Link>
              <Link
                to="/signup"
                id="nav-signup"
                className="h-9 inline-flex items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background hover:opacity-90 transition-opacity"
              >
                {t("nav_signup")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}