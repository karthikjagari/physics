import React from 'react';

const ProblemStatement: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="font-serif text-2xl font-medium text-primary mb-4">Why Virtual Labs Matter</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-primary-light rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Access Anywhere</h3>
            <p className="text-neutral-gray">Overcoming limitations of remote locations and limited infrastructure.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-secondary rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Cost Effective</h3>
            <p className="text-neutral-gray">Eliminating the high costs associated with physical lab equipment and materials.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="bg-success rounded-full p-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L8 8.243V17.5a1 1 0 102 0v-3.257z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-medium text-lg mb-2">Environmentally Friendly</h3>
            <p className="text-neutral-gray">Reducing chemical waste and environmental impact from traditional labs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemStatement;
