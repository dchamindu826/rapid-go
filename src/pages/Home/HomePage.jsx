import React from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import TrackingSection from '../../components/TrackingSection/TrackingSection'; // Ayemath import kara
import ShopCtaSection from '../../components/ShopCtaSection/ShopCtaSection';
import ServicesSection from '../../components/ServicesSection/ServicesSection';
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection';
import TestimonialsSection from '../../components/TestimonialsSection/TestimonialsSection';

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <TrackingSection /> {/* Ayemath methanata add kara */}
      <ShopCtaSection />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialsSection />
    </main>
  );
};

export default HomePage;