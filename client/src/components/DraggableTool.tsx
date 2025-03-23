import React, { useState, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Tool, ConnectionPoint as ConnectionPointType } from '@shared/schema';
import ConnectionPoint from './ConnectionPoint';

interface DraggableToolProps {
  tool: Tool;
  inWorkspace?: boolean;
  position?: { x: number, y: number };
  onPositionChange?: (id: number, x: number, y: number) => void;
  connectionPoints?: ConnectionPointType[];
  onConnectionPointClick?: (point: ConnectionPointType) => void;
  isConnectMode?: boolean;
  activeConnectionPoint?: string | null;
}

const DraggableTool: React.FC<DraggableToolProps> = ({ 
  tool, 
  inWorkspace = false,
  position,
  onPositionChange,
  connectionPoints = [],
  onConnectionPointClick,
  isConnectMode = false,
  activeConnectionPoint = null
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'tool',
    item: () => ({ id: tool.id, toolType: tool.type, tool }),
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      // If not dropped on a target, reset
      if (!monitor.didDrop()) {
        console.log("Tool was not dropped on a valid target");
      }
    }
  });

  // Get connection points for this tool
  const toolConnectionPoints = connectionPoints.filter(point => point.toolId === tool.id);

  const handleDragInWorkspace = (e: React.MouseEvent) => {
    if (!inWorkspace || !onPositionChange) return;
    
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    
    const startPosition = position || { x: 0, y: 0 };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      onPositionChange(tool.id, startPosition.x + dx, startPosition.y + dy);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle connection point click
  const handleConnectionPointClick = (point: ConnectionPointType) => {
    if (onConnectionPointClick) {
      onConnectionPointClick(point);
    }
  };

  // Determine connection points based on the tool type
  const getDefaultConnectionPoints = (): ConnectionPointType[] => {
    if (!position) return [];
    
    const baseX = position.x;
    const baseY = position.y;
    
    switch (tool.type) {
      case 'battery':
        return [
          { id: `${tool.id}-pos`, type: 'output', x: baseX + 25, y: baseY, toolId: tool.id, connected: false },
          { id: `${tool.id}-neg`, type: 'output', x: baseX - 25, y: baseY, toolId: tool.id, connected: false }
        ];
      case 'resistor':
        return [
          { id: `${tool.id}-in`, type: 'input', x: baseX - 25, y: baseY, toolId: tool.id, connected: false },
          { id: `${tool.id}-out`, type: 'output', x: baseX + 25, y: baseY, toolId: tool.id, connected: false }
        ];
      case 'wire':
        return [
          { id: `${tool.id}-start`, type: 'bidirectional', x: baseX - 25, y: baseY, toolId: tool.id, connected: false },
          { id: `${tool.id}-end`, type: 'bidirectional', x: baseX + 25, y: baseY, toolId: tool.id, connected: false }
        ];
      case 'bulb':
        return [
          { id: `${tool.id}-in`, type: 'input', x: baseX - 20, y: baseY + 10, toolId: tool.id, connected: false },
          { id: `${tool.id}-out`, type: 'input', x: baseX + 20, y: baseY + 10, toolId: tool.id, connected: false }
        ];
      default:
        return [];
    }
  };

  // If no connection points are provided, generate default ones
  const displayedConnectionPoints = toolConnectionPoints.length > 0 
    ? toolConnectionPoints 
    : getDefaultConnectionPoints();

  if (inWorkspace && position) {
    return (
      <>
        <div 
          className="absolute bg-white rounded shadow-md p-2 text-center cursor-move"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            opacity: isDragging ? 0.5 : 1,
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
          onMouseDown={handleDragInWorkspace}
        >
          <div className="flex justify-center mb-1">
            <img src={tool.iconUrl} alt={tool.name} className="h-8 w-8" />
          </div>
          <p className="text-xs font-medium">{tool.name}</p>
        </div>
        
        {/* Render connection points as SVG elements */}
        <svg className="absolute top-0 left-0 w-full h-full z-20">
          {displayedConnectionPoints.map(point => (
            <ConnectionPoint
              key={point.id}
              point={point}
              isActive={activeConnectionPoint === point.id}
              isConnectMode={isConnectMode}
              onClick={handleConnectionPointClick}
            />
          ))}
        </svg>
      </>
    );
  }

  return (
    <div 
      ref={drag}
      className={`bg-neutral-light rounded p-3 text-center cursor-move ${isDragging ? 'opacity-50' : ''}`}
      data-tool-id={tool.id}
    >
      <div className="flex justify-center mb-2">
        <img src={tool.iconUrl} alt={tool.name} className="h-10 w-10" />
      </div>
      <p className="text-sm font-medium">{tool.name}</p>
    </div>
  );
};

export default DraggableTool;
