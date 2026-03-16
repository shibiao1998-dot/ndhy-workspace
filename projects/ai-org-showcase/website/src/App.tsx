import HeroSection from './components/HeroSection';
import RevealSection from './components/RevealSection';
import ProcessSection from './components/ProcessSection';
import ContrastSection from './components/ContrastSection';
import ArchitectureSection from './components/ArchitectureSection';
import VisionSection from './components/VisionSection';
import CTASection from './components/CTASection';

/**
 * NDHY AI Agent Team — Product Showcase
 * Single-page scrolling narrative with 7 sections.
 */
export default function App() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <HeroSection />
      <RevealSection />
      <ProcessSection />
      <ContrastSection />
      <ArchitectureSection />
      <VisionSection />
      <CTASection />
    </div>
  );
}
