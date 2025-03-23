import React from 'react';
import { ConnectionPoint as ConnectionPointType } from '@shared/schema';

interface ConnectionPointProps {
  point: ConnectionPointType;
  isActive: boolean;
  isConnectMode: boolean;
  onClick: (point: ConnectionPointType) => void;
}

const ConnectionPoint: React.FC<ConnectionPointProps> = ({ 
  point, 
  isActive,
  isConnectMode, 
  onClick 
}) => {
  // Determine visual style based on connection point type and status
  const getPointColor = () => {
    if (isActive) return '#4CAF50'; // Green when active
    if (point.connected) return '#2196F3'; // Blue when already connected
    
    // Default colors by type
    switch (point.type) {
      case 'input':
        return '#FF5722'; // Orange for inputs
      case 'output':
        return '#673AB7'; // Purple for outputs
      default:
        return '#9E9E9E'; // Grey for bidirectional
    }
  };

  const handleClick = () => {
    if (isConnectMode) {
      onClick(point);
    }
  };

  return (
    <g 
      className={`connection-point ${point.type} ${isActive ? 'active' : ''} ${point.connected ? 'connected' : ''}`}
      onClick={handleClick}
      style={{ cursor: isConnectMode ? 'pointer' : 'default' }}
    >
      {/* Make hit area larger than visible circle */}
      <circle
        cx={point.x}
        cy={point.y}
        r={12}
        fill="transparent"
        pointerEvents="all"
        onClick={handleClick}
      />
      
      {/* Visual representation */}
      <circle
        cx={point.x}
        cy={point.y}
        r={6}
        fill={getPointColor()}
        stroke="#333"
        strokeWidth={1}
        pointerEvents="none"
      />
      
      {/* Visual indicator in connect mode */}
      {isConnectMode && (
        <circle
          cx={point.x}
          cy={point.y}
          r={10}
          fill="none"
          stroke={getPointColor()}
          strokeWidth={1}
          opacity={0.6}
          pointerEvents="none"
        />
      )}
    </g>
  );
};

export default ConnectionPoint;