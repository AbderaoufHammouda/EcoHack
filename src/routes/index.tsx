import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Discover } from "@/components/site/Discover";
import { MapSection } from "@/components/site/MapSection";
import { Eco } from "@/components/site/Eco";
import { Voices } from "@/components/site/Voices";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YouthLink Béjaïa — La jeunesse connectée aux opportunités de Béjaïa" },
      { name: "description", content: "Une plateforme légère et peu gourmande en données pour les activités, le bénévolat, les ateliers et les 68 structures de jeunesse de la wilaya de Béjaïa. Construit avec ODEJ Béjaïa." },
      { property: "og:title", content: "YouthLink Béjaïa" },
      { property: "og:description", content: "Le réseau calme qui connecte la jeunesse de Béjaïa à ce qui compte." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Discover />
        <MapSection />
        <Eco />
        <Voices />
      </main>
      <Footer />
    </div>
  );
}
