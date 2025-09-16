import React from 'react';
import HeroSection from '../../components/HeroSection/HeroSection'; // Path eka wenas kara
import TrackingSection from '../../components/TrackingSection/TrackingSection'; // Path eka wenas kara
import ShowcaseSection from '../../components/ShowcaseSection/ShowcaseSection'; // Path eka wenas kara
import ServicesSection from '../../components/ServicesSection/ServicesSection'; // Path eka wenas kara
import FeaturesSection from '../../components/FeaturesSection/FeaturesSection'; // Path eka wenas kara
import TestimonialsSection from '../../components/TestimonialsSection/TestimonialsSection'; // Path eka wenas kara

const HomePage = () => {
  return (
    <main>
      <HeroSection />
      <TrackingSection />
      <ShowcaseSection />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialsSection />
    </main>
  );
};

export default HomePage;