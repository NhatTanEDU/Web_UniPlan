// src/pages/Dashboard_before.tsx

import React, { useRef } from "react";
// import HeroCommunicate from "../components/HeroCommunicate";
import HeroProjectManagement from "../components/HeroProjectManagement";
import HeroIdeatocompletion from "../components/HeroIdeatocompletion";
import HeroGantt from "../components/HeroGantt";
// import HeroAIAssistant from "../components/HeroAI_Assistant";
import HeroDocumentManager from "../components/HerroDocument_Manager";
import HeroPricing from "../components/HeroPricing";
import HeroBanner from "../components/HeroBanner";
import HeroOverview from "../components/HeroOverview";
import TopButton from "../components/TopButton";
import Footer from "../components/Footer";
import Headerbefore from "../components/Before/Header_before";
import ScrollTrigger from "../components/ScrollTrigger"; // Đã cập nhật component này
import { COLORS } from "../constants/colors";

export default function Dashboard_before() {
  const refProjectManagement = useRef<HTMLElement | null>(null);
  const refIdeaToCompletion = useRef<HTMLElement | null>(null);
  const refGantt = useRef<HTMLElement | null>(null);
  // const refAIAssistant = useRef<HTMLElement | null>(null);
  const refDocumentManager = useRef<HTMLElement | null>(null);
  const refPricing = useRef<HTMLElement | null>(null);
  const refBanner = useRef<HTMLElement | null>(null);
  const refOverview = useRef<HTMLElement | null>(null);

  const scrollToSection = (section: string) => {
    let ref: React.RefObject<HTMLElement | null> | null = null;
    switch (section) {
      case "project-management":
        ref = refProjectManagement;
        break;
      case "idea-to-completion":
        ref = refIdeaToCompletion;
        break;
      case "gantt":
        ref = refGantt;
        break;
      // case "ai-assistant":
      //   ref = refAIAssistant;
      //   break;
      case "document-manager":
        ref = refDocumentManager;
        break;
      case "pricing":
        ref = refPricing;
        break;
      case "banner":
        ref = refBanner;
        break;
      case "overview":
        ref = refOverview;
        break;
      default:
        ref = null;
    }
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFooterClick = (item: string) => {
    console.log(`Đã click vào ${item}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      <Headerbefore onNavigate={scrollToSection} />

      <main className="">
        {/* HERO BANNER (có video nền) */}
        <section ref={refBanner}>
          <ScrollTrigger delay={0.1} direction="up" ease="easeOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroBanner />
          </ScrollTrigger>
        </section>

        {/* HERO OVERVIEW (ảnh bao quát) */}
        <section ref={refOverview}>
          <ScrollTrigger delay={0.2} direction="up" ease="easeOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroOverview />
          </ScrollTrigger>
        </section>

        {/* Các Hero Sections chức năng */}
        <section ref={refProjectManagement}>
          <ScrollTrigger delay={0.3} direction="left" ease="easeOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroProjectManagement />
          </ScrollTrigger>
        </section>

        {/* <section ref={refCommunicate}>
          <ScrollTrigger delay={0.4} direction="right" ease={[0.17, 0.67, 0.83, 0.67]} amount={0.1}> 
            <HeroCommunicate />
          </ScrollTrigger>
        </section> */}

        <section ref={refIdeaToCompletion}>
          <ScrollTrigger delay={0.5} direction="up" ease="easeInOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroIdeatocompletion />
          </ScrollTrigger>
        </section>

        <section ref={refGantt}>
          <ScrollTrigger delay={0.6} direction="up" ease="easeOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroGantt />
          </ScrollTrigger>
        </section>

        {/* <section ref={refAIAssistant}>
          <ScrollTrigger delay={0.7} direction="left" ease="easeOut" amount={0.1}> 
            <HeroAIAssistant />
          </ScrollTrigger>
        </section> */}

        <section ref={refDocumentManager}>
          <ScrollTrigger delay={0.8} direction="right" ease="easeOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroDocumentManager />
          </ScrollTrigger>
        </section>

        <section ref={refPricing}>
          <ScrollTrigger delay={0.9} direction="up" ease="easeInOut" amount={0.1}> {/* amount nhỏ hơn */}
            <HeroPricing />
          </ScrollTrigger>
        </section>
      </main>

      <footer>
        <ScrollTrigger delay={1.0} direction="up" ease="easeOut" amount={0.1}>
          <Footer onFooterClick={handleFooterClick} />
        </ScrollTrigger>
      </footer>
      <TopButton />
    </div>
  );
}