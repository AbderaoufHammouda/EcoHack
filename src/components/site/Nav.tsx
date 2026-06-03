import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLang, type Lang } from "@/contexts/lang-context";

const LANGS: { code: Lang; label: string }[] = [
  { code: "FR", label: "FR" },
  { code: "AR", label: "AR" },
  { code: "TZM", label: "Kabyle" },
];

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ylb_theme") !== "light";
    }
    return true;
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove("light");
      localStorage.setItem("ylb_theme", "dark");
    } else {
      html.classList.add("light");
      localStorage.setItem("ylb_theme", "light");
    }
  }, [isDark]);

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
          {/* Language switcher */}
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

          {/* Dark / Light toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="h-8 w-8 grid place-items-center rounded-full border hairline bg-surface/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

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