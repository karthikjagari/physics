import React from 'react';

const FeatureSection: React.FC = () => {
  return (
    <div className="bg-neutral-light py-12 mt-12">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-primary mb-8 text-center">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-secondary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">AI-Guided Learning</h3>
            <p className="text-neutral-gray">Intelligent assistance that adapts to your learning pace and knowledge level.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-secondary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm1 4a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Result Analysis</h3>
            <p className="text-neutral-gray">Detailed analysis of experiment results with visual representations and insights.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-secondary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Interactive Controls</h3>
            <p className="text-neutral-gray">Adjust variables in real-time to observe how changes affect experimental outcomes.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-secondary mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Save & Share</h3>
            <p className="text-neutral-gray">Save your experiments and share results with teachers or classmates for collaboration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
