import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Experiment } from '@shared/schema';

interface ExperimentCardProps {
  experiment: Experiment;
}

const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment }) => {
  const { id, title, description, category, imageUrl } = experiment;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-neutral-light flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="text-center p-4 text-neutral-gray">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p>Experiment Image</p>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-serif text-xl font-medium text-primary mb-2">{title}</h3>
        <p className="text-neutral-gray mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm bg-neutral-light px-2 py-1 rounded">{category}</span>
          <Link href={`/experiment/${id}`}>
            <Button variant="secondary">Start Experiment</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExperimentCard;
