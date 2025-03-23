import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { Experiment as ExperimentType, Tool, SimulationResult } from '@shared/schema';
import VideoPlayer from '@/components/VideoPlayer';
import DraggableTool from '@/components/DraggableTool';
import Workspace from '@/components/Workspace';
import ObservationsPanel from '@/components/ObservationsPanel';
import { Button } from '@/components/ui/button';

const Experiment: React.FC = () => {
  const [match, params] = useRoute('/experiment/:id');
  const experimentId = params?.id;
  const [simulationResults, setSimulationResults] = useState<SimulationResult | null>(null);
  
  const { data: experiment, isLoading: experimentLoading, isError: experimentError } = useQuery<ExperimentType>({
    queryKey: [`/api/experiments/${experimentId}`],
    enabled: !!experimentId,
  });
  
  const { data: tools, isLoading: toolsLoading, isError: toolsError } = useQuery<Tool[]>({
    queryKey: [`/api/experiments/${experimentId}/tools`],
    enabled: !!experimentId,
  });
  
  const handleSimulationResults = (results: SimulationResult) => {
    setSimulationResults(results);
  };
  
  // Reset simulation results when experiment changes
  useEffect(() => {
    setSimulationResults(null);
  }, [experimentId]);
  
  const isLoading = experimentLoading || toolsLoading;
  const isError = experimentError || toolsError;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <p className="mt-4 text-neutral-gray">Loading experiment...</p>
      </div>
    );
  }
  
  if (isError || !experiment || !tools) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Link href="/">
          <Button className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Button>
        </Link>
        <div className="text-center py-12 text-error">
          <p>There was an error loading the experiment. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-light min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="flex items-center text-primary hover:text-primary-dark mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Experiments
          </Button>
        </Link>
        
        {/* Experiment Title */}
        <h1 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-6">
          {experiment.title}
        </h1>
        
        {/* Experiment Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Video & Instructions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video Demo */}
            <VideoPlayer videoUrl={experiment.videoUrl} title={experiment.title} />
            
            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-medium text-xl mb-3">Instructions</h2>
              <div className="prose max-w-none text-neutral-dark" dangerouslySetInnerHTML={{ __html: experiment.instructions }} />
            </div>
            
            {/* Theory */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-medium text-xl mb-3">Theory</h2>
              <div className="prose max-w-none text-neutral-dark" dangerouslySetInnerHTML={{ __html: experiment.theory }} />
            </div>
          </div>
          
          {/* Right Panel - Interactive Workspace */}
          <div className="lg:col-span-2 space-y-6">
            {/* Toolbox */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="font-medium text-xl mb-3">Available Tools</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <DraggableTool key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
            
            {/* Workspace */}
            <Workspace 
              experiment={experiment} 
              tools={tools} 
              onSimulationResults={handleSimulationResults} 
            />
            
            {/* Observations */}
            <ObservationsPanel simulationResults={simulationResults} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiment;
