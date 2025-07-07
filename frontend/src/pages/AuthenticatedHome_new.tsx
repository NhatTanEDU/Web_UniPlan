// src/pages/AuthenticatedHome.tsx
import React, { useRef } from "react";
import { useSubscription } from "../components/context/SubscriptionContext";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header_Home";
import HeroCommunicate from "../components/HeroCommunicate";
import HeroProjectManagement from "../components/HeroProjectManagement";
import HeroIdeatocompletion from "../components/HeroIdeatocompletion";
import HeroGantt from "../components/HeroGantt";
import HeroAIAssistant from "../components/HeroAI_Assistant";
import HeroDocumentManager from "../components/HerroDocument_Manager";
import HeroPricing from "../components/HeroPricing";
import HeroBanner from "../components/HeroBanner";
import HeroOverview from "../components/HeroOverview";
import TopButton from "../components/TopButton";
import Footer from "../components/Footer";
import ScrollTrigger from "../components/ScrollTrigger";
import { COLORS } from "../constants/colors";

const AuthenticatedHome: React.FC = () => {
  const { subscriptionStatus } = useSubscription();
  const { userId, role } = useAuth();
  const navigate = useNavigate();
  
  // Refs for scroll navigation
  const refProjectManagement = useRef<HTMLElement | null>(null);
  const refCommunicate = useRef<HTMLElement | null>(null);
  const refIdeaToCompletion = useRef<HTMLElement | null>(null);
  const refGantt = useRef<HTMLElement | null>(null);
  const refAIAssistant = useRef<HTMLElement | null>(null);
  const refDocumentManager = useRef<HTMLElement | null>(null);
  const refPricing = useRef<HTMLElement | null>(null);
  const refBanner = useRef<HTMLElement | null>(null);
  const refOverview = useRef<HTMLElement | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    // Handle logout logic here - đi về trang login
    navigate('/login');
  };

  // Scroll to section function
  const scrollToSection = (section: string) => {
    let ref: React.RefObject<HTMLElement | null> | null = null;
    switch (section) {
      case "project-management":
        ref = refProjectManagement;
        break;
      case "communicate":
        ref = refCommunicate;
        break;
      case "idea-to-completion":
        ref = refIdeaToCompletion;
        break;
      case "gantt":
        ref = refGantt;
        break;
      case "ai-assistant":
        ref = refAIAssistant;
        break;
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
        break;
    }
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="authenticated-home" style={{ minHeight: '100vh', backgroundColor: COLORS.background }}>
      {/* Header với thông tin subscription - Không truyền user props để Header tự lấy từ localStorage */}
      <Header 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      {/* Main content */}
      <main style={{ paddingTop: '80px' }}>
        <section ref={refOverview}>
          <HeroOverview />
        </section>
        
        <section ref={refProjectManagement}>
          <HeroProjectManagement />
        </section>
        
        <section ref={refCommunicate}>
          <HeroCommunicate />
        </section>
        
        <section ref={refIdeaToCompletion}>
          <HeroIdeatocompletion />
        </section>
        
        <section ref={refGantt}>
          <HeroGantt />
        </section>
        
        <section ref={refAIAssistant}>
          <HeroAIAssistant />
        </section>
        
        <section ref={refDocumentManager}>
          <HeroDocumentManager />
        </section>
        
        {/* Pricing section */}
        <section ref={refPricing}>
          <HeroPricing />
        </section>
        
        <section ref={refBanner}>
          <HeroBanner />
        </section>
      </main>

      {/* ScrollTrigger với content */}
      <ScrollTrigger>
        <div />
      </ScrollTrigger>
      
      <TopButton />
      
      {/* Footer */}
      <Footer />
      
      {/* Show current subscription status for debugging */}
      {subscriptionStatus && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 9999
        }}>
          Plan: {subscriptionStatus.subscriptionType} | Role: {role}
        </div>
      )}
    </div>
  );
};

export default AuthenticatedHome;


