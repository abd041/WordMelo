import { Capabilities } from "@/components/home/Capabilities";
import { FeaturedTools } from "@/components/home/FeaturedTools";
import { Hero } from "@/components/home/Hero";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeIntro } from "@/components/home/HomeIntro";
import { HowItWorks } from "@/components/home/HowItWorks";
import { UseCases } from "@/components/home/UseCases";
import { ValueStrip } from "@/components/home/ValueStrip";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Free Online Text & Writing Tools | WordMelo",
  description:
    "Free online writing tools that make everyday text work easier. Count words, convert letter case, or create stylish Unicode fonts with WordMelo.",
  path: "/",
  keywords: [
    "free online text tools",
    "online writing tools",
    "free writing tools",
    "text utilities",
    "word and character counter",
    "case converter",
    "fancy text generator",
    "wordmelo",
  ],
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <ValueStrip />
      <FeaturedTools />
      <Capabilities />
      <HowItWorks />
      <UseCases />
      <HomeIntro />
      <HomeFAQ />
      <div className="ad-region" aria-hidden="true" />
    </>
  );
}
