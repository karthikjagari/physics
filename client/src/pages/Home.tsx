import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ExperimentCard from '@/components/ExperimentCard';
import HeroSection from '@/components/HeroSection';
import ProblemStatement from '@/components/ProblemStatement';
import FeatureSection from '@/components/FeatureSection';
import { Experiment } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Home: React.FC = () => {
  const experimentsRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: experiments, isLoading, isError } = useQuery<Experiment[]>({
    queryKey: ['/api/experiments'],
  });
  
  // Filter experiments based on search query
  const filteredExperiments = experiments?.filter(experiment => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      experiment.title.toLowerCase().includes(query) || 
      experiment.description.toLowerCase().includes(query) ||
      experiment.type.toLowerCase().includes(query) ||
      experiment.category.toLowerCase().includes(query)
    );
  });
  
  const scrollToExperiments = () => {
    if (experimentsRef.current) {
      experimentsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  return (
    <div>
      <HeroSection onExploreClick={scrollToExperiments} />
      <ProblemStatement />
      
      <div className="container mx-auto px-4 py-8" id="experiments" ref={experimentsRef}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-4 md:mb-0">Available Experiments</h2>
          
          {/* Search input */}
          <div className="relative w-full md:w-auto">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray">
              <Search size={18} />
            </div>
            <Input 
              type="text"
              placeholder="Search experiments..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 w-full md:w-64 border-neutral-light focus:border-primary"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-4 text-neutral-gray">Loading experiments...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-error">
            <p>There was an error loading the experiments. Please try again later.</p>
          </div>
        ) : filteredExperiments?.length === 0 ? (
          <div className="text-center py-16 bg-neutral-lightest rounded-lg">
            <Search size={40} className="mx-auto text-neutral-gray mb-4" />
            <h3 className="text-xl font-medium mb-2">No matching experiments found</h3>
            <p className="text-neutral-gray">Try adjusting your search terms or browse all experiments by clearing the search.</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-primary hover:underline focus:outline-none"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments?.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        )}
      </div>
      
      <FeatureSection />
    </div>
  );
};

export default Home;
