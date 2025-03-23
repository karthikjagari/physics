import React, { useState } from 'react';
import { SimulationResult } from '@shared/schema';
import { Textarea } from '@/components/ui/textarea';

interface ObservationsPanelProps {
  simulationResults: SimulationResult | null;
}

const ObservationsPanel: React.FC<ObservationsPanelProps> = ({ simulationResults }) => {
  const [notes, setNotes] = useState('');
  
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="font-medium text-xl mb-3">Observations & Results</h2>
      <div className="min-h-[100px]">
        {!simulationResults ? (
          <div className="text-neutral-gray text-center py-6">
            Run the simulation to see results
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-neutral-lightest rounded">
              <h3 className="font-medium mb-2">Measurements</h3>
              <div className="text-sm space-y-2">
                {simulationResults.measurements.map((measurement, index) => (
                  <p key={index}><strong>{measurement.label}:</strong> {measurement.value} {measurement.unit}</p>
                ))}
              </div>
            </div>
            
            {simulationResults.graphData && (
              <div className="mb-4 p-3 bg-neutral-lightest rounded">
                <h3 className="font-medium mb-2">{simulationResults.graphTitle || "Graph"}</h3>
                <div className="text-sm flex justify-center">
                  <div className="bg-neutral-light h-40 w-full max-w-md rounded flex items-center justify-center relative overflow-hidden">
                    {/* Simple SVG Graph Visualization */}
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="90" x2="100" y2="90" stroke="#ccc" strokeWidth="0.5" />
                      <line x1="10" y1="0" x2="10" y2="100" stroke="#ccc" strokeWidth="0.5" />
                      
                      {/* Axes Labels */}
                      <text x="50" y="98" textAnchor="middle" className="text-xs fill-neutral-600">
                        {simulationResults.graphTitle?.includes('Time') ? 'Time (s)' : 
                         simulationResults.graphTitle?.includes('Current') ? 'Current (A)' : 
                         simulationResults.graphTitle?.includes('Trajectory') ? 'Distance (m)' : 'X'}
                      </text>
                      
                      <text x="3" y="50" textAnchor="middle" transform="rotate(-90, 3, 50)" className="text-xs fill-neutral-600">
                        {simulationResults.graphTitle?.includes('Position') ? 'Height (m)' : 
                         simulationResults.graphTitle?.includes('Voltage') ? 'Voltage (V)' : 
                         simulationResults.graphTitle?.includes('Trajectory') ? 'Height (m)' : 'Y'}
                      </text>
                      
                      {/* Plotting Graph Data */}
                      {simulationResults.graphData && simulationResults.graphData.length > 1 && (
                        <polyline
                          points={simulationResults.graphData.map(point => {
                            // Scale x and y to fit within SVG viewBox
                            // Map x from 0 to data max to 10-90% of width
                            // Map y from 0 to data max to 90-10% of height (inverted y-axis)
                            const graphData = simulationResults.graphData || [];
                            const maxX = Math.max(...graphData.map(p => p.x));
                            const maxY = Math.max(...graphData.map(p => p.y));
                            
                            const x = 10 + (point.x / maxX) * 80;
                            // Invert Y axis for SVG (0 at top, grows downward)
                            const y = 90 - (point.y / maxY) * 80;
                            
                            return `${x},${y}`;
                          }).join(' ')}
                          stroke="#4CAF50"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 bg-neutral-lightest rounded">
              <h3 className="font-medium mb-2">Notes</h3>
              <Textarea 
                className="w-full text-sm"
                placeholder="Record your observations here..."
                value={notes}
                onChange={handleNotesChange}
                rows={3}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ObservationsPanel;
