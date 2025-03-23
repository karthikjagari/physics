import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';

const Navigation: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828l-3.172-3.172a2 2 0 00-2.828 0L8 8.243V17.5a1 1 0 102 0v-3.257z" clipRule="evenodd" />
              <path d="M12.5 0h-2a.5.5 0 00-.5.5v.634a1.5 1.5 0 002.998.092l.002-.226V.5a.5.5 0 00-.5-.5z" />
            </svg>
            <span className="font-serif text-xl font-medium">VirtuLab</span>
          </div>
        </Link>
        
        {/* Navigation Items */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className={`hover:text-neutral-light transition duration-200 ${location === '/' ? 'font-medium' : ''}`}>
            Home
          </Link>
          <a href="#experiments" className="hover:text-neutral-light transition duration-200">Experiments</a>
          <a href="#" className="hover:text-neutral-light transition duration-200">About</a>
          <a href="#" className="hover:text-neutral-light transition duration-200">Resources</a>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-2 space-y-1 bg-primary-dark">
            <Link 
              href="/" 
              className="block py-2 px-3 hover:bg-primary-light rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a 
              href="#experiments" 
              className="block py-2 px-3 hover:bg-primary-light rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Experiments
            </a>
            <a 
              href="#" 
              className="block py-2 px-3 hover:bg-primary-light rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </a>
            <a 
              href="#" 
              className="block py-2 px-3 hover:bg-primary-light rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Resources
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
