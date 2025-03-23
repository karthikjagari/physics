import React from 'react';
import { Connection, ConnectionPoint } from '@shared/schema';

interface ConnectionLineProps {
  connection: Connection;
  connectionPoints: ConnectionPoint[];
  onDelete?: (connectionId: string) => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({ 
  connection, 
  connectionPoints,
  onDelete
}) => {
  // Find the source and target connection points
  const sourcePoint = connectionPoints.find(point => point.id === connection.sourceId);
  const targetPoint = connectionPoints.find(point => point.id === connection.targetId);
  
  if (!sourcePoint || !targetPoint) {
    return null;
  }

  // Calculate path for the connection line
  const path = `M ${sourcePoint.x} ${sourcePoint.y} L ${targetPoint.x} ${targetPoint.y}`;
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(connection.id);
    }
  };

  return (
    <g className="connection-line">
      {/* Invisible wider path for better hit detection */}
      <path 
        d={path} 
        stroke="transparent" 
        strokeWidth={10} 
        fill="none"
        style={{ cursor: onDelete ? 'pointer' : 'default' }}
      />
      
      {/* Visible path */}
      <path 
        d={path} 
        stroke="#666" 
        strokeWidth={2} 
        fill="none"
        style={{ pointerEvents: 'none' }}
      />
      
      {onDelete && (
        <g>
          {/* Larger invisible hit area */}
          <circle
            cx={(sourcePoint.x + targetPoint.x) / 2}
            cy={(sourcePoint.y + targetPoint.y) / 2}
            r={12}
            fill="transparent"
            onClick={handleDelete}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Visible delete button */}
          <circle
            cx={(sourcePoint.x + targetPoint.x) / 2}
            cy={(sourcePoint.y + targetPoint.y) / 2}
            r={8}
            fill="white"
            stroke="#ff4444"
            strokeWidth={1}
            style={{ pointerEvents: 'none' }}
          >
            <title>Remove connection</title>
          </circle>
          
          {/* X symbol */}
          <g style={{ pointerEvents: 'none' }}>
            <line 
              x1={(sourcePoint.x + targetPoint.x) / 2 - 3} 
              y1={(sourcePoint.y + targetPoint.y) / 2 - 3} 
              x2={(sourcePoint.x + targetPoint.x) / 2 + 3} 
              y2={(sourcePoint.y + targetPoint.y) / 2 + 3} 
              stroke="#ff4444" 
              strokeWidth={1.5} 
            />
            <line 
              x1={(sourcePoint.x + targetPoint.x) / 2 - 3} 
              y1={(sourcePoint.y + targetPoint.y) / 2 + 3} 
              x2={(sourcePoint.x + targetPoint.x) / 2 + 3} 
              y2={(sourcePoint.y + targetPoint.y) / 2 - 3} 
              stroke="#ff4444" 
              strokeWidth={1.5} 
            />
          </g>
        </g>
      )}
    </g>
  );
};

export default ConnectionLine;