import React from 'react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onExploreClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            AI-Powered Virtual Physics Laboratory
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Experience hands-on science experiments from anywhere, reducing costs and environmental impact 
            while enhancing learning opportunities.
          </p>
          <Button 
            variant="accent" 
            size="lg"
            className="shadow-lg"
            onClick={onExploreClick}
          >
            Explore Experiments
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
