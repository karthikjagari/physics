import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Tool, Experiment, SimulationResult, ConnectionPoint as ConnectionPointType, Connection } from '@shared/schema';
import DraggableTool from './DraggableTool';
import ConnectionLine from './ConnectionLine';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { setupMatterSimulation, cleanupMatterSimulation } from '@/lib/physics';
import { v4 as uuidv4 } from 'uuid';

interface WorkspaceProps {
  experiment: Experiment;
  tools: Tool[];
  onSimulationResults: (results: SimulationResult) => void;
}

interface PlacedTool {
  id: number;
  position: { x: number, y: number };
}

const Workspace: React.FC<WorkspaceProps> = ({ experiment, tools, onSimulationResults }) => {
  const [workspaceTools, setWorkspaceTools] = useState<PlacedTool[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectionPoints, setConnectionPoints] = useState<ConnectionPointType[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnectionPoint, setActiveConnectionPoint] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Reference to track workspace container dimensions
  const [workspaceRef, setWorkspaceRef] = useState<HTMLDivElement | null>(null);
  const [workspaceDimensions, setWorkspaceDimensions] = useState({ width: 0, height: 0 });
  
  // Update connection points when tools move
  useEffect(() => {
    // Calculate and update connection points for all tools
    const updatedPoints: ConnectionPointType[] = [];
    
    workspaceTools.forEach(placedTool => {
      const tool = tools.find(t => t.id === placedTool.id);
      if (!tool) return;
      
      // Get existing connection points for this tool
      const existingPoints = connectionPoints.filter(p => p.toolId === tool.id);
      
      // If no existing points, generate default ones
      if (existingPoints.length === 0) {
        const baseX = placedTool.position.x;
        const baseY = placedTool.position.y;
        
        switch (tool.type) {
          case 'battery':
            updatedPoints.push(
              { id: `${tool.id}-pos`, type: 'output', x: baseX + 25, y: baseY, toolId: tool.id, connected: false },
              { id: `${tool.id}-neg`, type: 'output', x: baseX - 25, y: baseY, toolId: tool.id, connected: false }
            );
            break;
          case 'resistor':
            updatedPoints.push(
              { id: `${tool.id}-in`, type: 'input', x: baseX - 25, y: baseY, toolId: tool.id, connected: false },
              { id: `${tool.id}-out`, type: 'output', x: baseX + 25, y: baseY, toolId: tool.id, connected: false }
            );
            break;
          case 'wire':
            updatedPoints.push(
              { id: `${tool.id}-start`, type: 'bidirectional', x: baseX - 25, y: baseY, toolId: tool.id, connected: false },
              { id: `${tool.id}-end`, type: 'bidirectional', x: baseX + 25, y: baseY, toolId: tool.id, connected: false }
            );
            break;
          case 'bulb':
            updatedPoints.push(
              { id: `${tool.id}-in`, type: 'input', x: baseX - 20, y: baseY + 10, toolId: tool.id, connected: false },
              { id: `${tool.id}-out`, type: 'input', x: baseX + 20, y: baseY + 10, toolId: tool.id, connected: false }
            );
            break;
          default:
            break;
        }
      } else {
        // Update positions of existing connection points relative to tool position
        existingPoints.forEach(point => {
          // Calculate the offset from the tool's center
          const offsetX = point.x - (connections.some(c => c.sourceId === point.id || c.targetId === point.id) 
            ? point.x 
            : placedTool.position.x);
          const offsetY = point.y - (connections.some(c => c.sourceId === point.id || c.targetId === point.id)
            ? point.y
            : placedTool.position.y);
          
          // Apply the offset to the updated tool position
          updatedPoints.push({
            ...point,
            x: placedTool.position.x + offsetX,
            y: placedTool.position.y + offsetY
          });
        });
      }
    });
    
    // Filter out connection points for removed tools
    const placedToolIds = workspaceTools.map(tool => tool.id);
    const filteredConnectionPoints = connectionPoints.filter(point => 
      placedToolIds.includes(point.toolId)
    );
    
    // If there are changes, update the state
    if (JSON.stringify(filteredConnectionPoints) !== JSON.stringify(updatedPoints) && updatedPoints.length > 0) {
      setConnectionPoints(updatedPoints);
    }
    
  }, [workspaceTools, tools]);
  
  // Set up Matter.js simulation
  useEffect(() => {
    if (isSimulating && workspaceRef) {
      const simulationContainer = document.getElementById('simulation-container');
      if (simulationContainer) {
        const placedTools = workspaceTools.map(placedTool => {
          const tool = tools.find(t => t.id === placedTool.id);
          return {
            ...placedTool,
            tool
          };
        }).filter(item => item.tool);
        
        const cleanup = setupMatterSimulation(
          simulationContainer, 
          placedTools, 
          experiment, 
          connections,
          (results) => {
            setIsSimulating(false);
            onSimulationResults(results);
            toast({
              title: "Simulation Complete",
              description: "Your experiment results are ready to view.",
            });
          }
        );
        
        return () => {
          cleanup();
        };
      }
    }
  }, [isSimulating, workspaceTools, tools, experiment, connections, workspaceRef, onSimulationResults, toast]);
  
  // Set up workspace dimensions on mount and resize
  useEffect(() => {
    if (workspaceRef) {
      const updateDimensions = () => {
        setWorkspaceDimensions({
          width: workspaceRef.offsetWidth,
          height: workspaceRef.offsetHeight
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [workspaceRef]);
  
  const [{ isOver }, drop] = useDrop({
    accept: 'tool',
    drop: (item: { id: number; toolType: string; tool?: Tool }, monitor) => {
      const dropOffset = monitor.getClientOffset();
      if (workspaceRef && dropOffset) {
        const workspaceRect = workspaceRef.getBoundingClientRect();
        const x = dropOffset.x - workspaceRect.left;
        const y = dropOffset.y - workspaceRect.top;
        
        console.log("Dropping tool:", item.id, "at position:", x, y);
        addToolToWorkspace(item.id, x, y);
        return { dropped: true };
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  const addToolToWorkspace = (toolId: number, x: number, y: number) => {
    // Check if tool already exists in workspace
    if (workspaceTools.some(tool => tool.id === toolId)) {
      return;
    }
    
    setWorkspaceTools(prev => [...prev, { id: toolId, position: { x, y } }]);
  };
  
  const updateToolPosition = (toolId: number, x: number, y: number) => {
    setWorkspaceTools(prev => 
      prev.map(tool => 
        tool.id === toolId 
          ? { ...tool, position: { x, y } } 
          : tool
      )
    );
    
    // Also update positions of any connection points for this tool
    setConnectionPoints(prev => 
      prev.map(point => {
        if (point.toolId === toolId) {
          // If this point is connected, don't update its position (maintain the connection)
          if (connections.some(c => c.sourceId === point.id || c.targetId === point.id)) {
            return point;
          }
          
          // Otherwise, calculate new position based on tool movement
          const toolConnectionPoints = prev.filter(p => p.toolId === toolId);
          if (toolConnectionPoints.length === 0) return point;
          
          // Get the relative position within the tool
          const oldTool = workspaceTools.find(t => t.id === toolId);
          if (!oldTool) return point;
          
          // Calculate the offset from the tool's center
          const offsetX = point.x - oldTool.position.x;
          const offsetY = point.y - oldTool.position.y;
          
          // Apply the offset to the updated tool position
          return {
            ...point,
            x: x + offsetX,
            y: y + offsetY
          };
        }
        return point;
      })
    );
  };
  
  const clearWorkspace = () => {
    setWorkspaceTools([]);
    setConnectionPoints([]);
    setConnections([]);
    setActiveConnectionPoint(null);
    setIsConnectMode(false);
    cleanupMatterSimulation();
    setIsSimulating(false);
  };
  
  const toggleConnectionMode = () => {
    setIsConnectMode(prev => !prev);
    setActiveConnectionPoint(null);
    
    toast({
      title: isConnectMode ? "Connection Mode Disabled" : "Connection Mode Enabled",
      description: isConnectMode 
        ? "You can now move components freely." 
        : "Click on connection points to create connections between components.",
    });
  };
  
  const handleConnectionPointClick = (point: ConnectionPointType) => {
    if (!isConnectMode) return;
    
    // If no active connection point, set this as active
    if (!activeConnectionPoint) {
      setActiveConnectionPoint(point.id);
      
      // Highlight the selected connection point
      toast({
        title: "Connection Started",
        description: "Now click on another component's connection point to complete the connection.",
      });
      return;
    }
    
    // Don't connect a point to itself
    if (activeConnectionPoint === point.id) {
      setActiveConnectionPoint(null);
      return;
    }
    
    // Find the active connection point
    const sourcePoint = connectionPoints.find(p => p.id === activeConnectionPoint);
    if (!sourcePoint) {
      setActiveConnectionPoint(null);
      return;
    }
    
    // Don't connect points on the same tool
    if (sourcePoint.toolId === point.toolId) {
      toast({
        title: "Invalid Connection",
        description: "You cannot connect points on the same component.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for connection compatibility based on point types
    // Input can connect to output, or bidirectional can connect to anything
    const isCompatible = 
      sourcePoint.type === 'bidirectional' || 
      point.type === 'bidirectional' || 
      (sourcePoint.type === 'output' && point.type === 'input') ||
      (sourcePoint.type === 'input' && point.type === 'output');
    
    if (!isCompatible) {
      toast({
        title: "Incompatible Connection",
        description: "These connection points are not compatible with each other.",
        variant: "destructive",
      });
      setActiveConnectionPoint(null);
      return;
    }
    
    // Check if this point is already connected
    const isPointAlreadyConnected = connections.some(
      c => c.sourceId === point.id || c.targetId === point.id
    );
    
    // For all connections except wires, don't allow multiple connections to the same point
    if (isPointAlreadyConnected) {
      // Get the tool type for this connection point
      const tool = tools.find(t => t.id === point.toolId);
      
      // Allow multiple connections only for wire type components
      if (tool?.type !== 'wire') {
        toast({
          title: "Point Already Connected",
          description: "This connection point already has a connection. Only wires can have multiple connections.",
          variant: "destructive",
        });
        setActiveConnectionPoint(null);
        return;
      }
    }
    
    // Create the connection
    const newConnection: Connection = {
      id: uuidv4(),
      sourceId: sourcePoint.id,
      targetId: point.id,
      sourceTool: sourcePoint.toolId,
      targetTool: point.toolId
    };
    
    // Update connection status for these points
    setConnectionPoints(prev => 
      prev.map(p => 
        p.id === sourcePoint.id || p.id === point.id
          ? { ...p, connected: true }
          : p
      )
    );
    
    // Add the connection
    setConnections(prev => [...prev, newConnection]);
    
    // Reset active connection point
    setActiveConnectionPoint(null);
    
    toast({
      title: "Connection Created",
      description: "Components are now connected successfully.",
    });
  };
  
  const deleteConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;
    
    // Remove the connection
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    
    // Update connection status for the points
    // Only mark as disconnected if the point isn't used in any other connection
    setConnectionPoints(prev => 
      prev.map(p => {
        if (p.id === connection.sourceId || p.id === connection.targetId) {
          const isUsedInOtherConnection = connections.some(c => 
            c.id !== connectionId && (c.sourceId === p.id || c.targetId === p.id)
          );
          
          return isUsedInOtherConnection 
            ? p 
            : { ...p, connected: false };
        }
        return p;
      })
    );
    
    toast({
      title: "Connection Removed",
      description: "The connection has been deleted.",
    });
  };
  
  const runSimulation = () => {
    if (workspaceTools.length === 0) {
      toast({
        title: "No tools in workspace",
        description: "Please add some tools to the workspace first.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the required tools for this experiment are present
    const requiredToolTypes = experiment.requiredTools || [];
    const placedToolIds = workspaceTools.map(tool => tool.id);
    const placedTools = tools.filter(tool => placedToolIds.includes(tool.id));
    const placedToolTypes = placedTools.map(tool => tool.type);
    
    const missingTools = requiredToolTypes.filter(type => !placedToolTypes.includes(type));
    
    if (missingTools.length > 0) {
      toast({
        title: "Missing required tools",
        description: `Please add: ${missingTools.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    // For electric circuits, check if there's a complete circuit
    if (experiment.type === 'electric-circuits') {
      if (connections.length === 0) {
        toast({
          title: "Incomplete Circuit",
          description: "Connect components to create a complete circuit.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if we have at least one battery in the workspace
      const hasBattery = placedTools.some(tool => tool.type === 'battery');
      if (!hasBattery) {
        toast({
          title: "Missing Power Source",
          description: "Your circuit needs a battery to function.",
          variant: "destructive",
        });
        return;
      }
      
      // Check for a closed circuit by verifying battery is connected properly
      const batteryIds = placedTools
        .filter(tool => tool.type === 'battery')
        .map(tool => tool.id);
      
      // Find battery connection points
      const batteryConnectionPoints = connectionPoints.filter(
        point => batteryIds.includes(point.toolId)
      );
      
      // Check if both positive and negative terminals are connected
      const batteryTerminalsConnected = batteryConnectionPoints.every(
        point => connections.some(conn => 
          conn.sourceId === point.id || conn.targetId === point.id
        )
      );
      
      if (!batteryTerminalsConnected) {
        toast({
          title: "Open Circuit",
          description: "Your circuit is not complete. Make sure both terminals of the battery are connected.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSimulating(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-xl">Experiment Workspace</h2>
        <div className="space-x-2">
          <Button 
            variant={isConnectMode ? "secondary" : "outline"} 
            size="sm" 
            onClick={toggleConnectionMode}
            disabled={isSimulating}
          >
            {isConnectMode ? 'Exit Connect Mode' : 'Connect Mode'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={clearWorkspace}
            disabled={isSimulating}
          >
            Clear
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={runSimulation}
            disabled={isSimulating}
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </div>
      </div>
      
      <div 
        ref={(node) => {
          drop(node);
          setWorkspaceRef(node);
        }}
        className={`border-2 ${isOver ? 'border-primary' : 'border-dashed border-neutral-medium'} rounded-lg p-4 min-h-[350px] relative`}
        id="simulation-container"
      >
        {workspaceTools.length === 0 && !isSimulating && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-gray">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Drag and drop tools here to build your experiment</p>
            </div>
          </div>
        )}
        
        {/* Connections between tools */}
        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 5 }}>
          {connections.map(connection => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              connectionPoints={connectionPoints}
              onDelete={isConnectMode ? deleteConnection : undefined}
            />
          ))}
        </svg>
        
        {/* Placed tools */}
        {workspaceTools.map((placedTool) => {
          const tool = tools.find(t => t.id === placedTool.id);
          if (!tool) return null;
          
          return (
            <DraggableTool
              key={placedTool.id}
              tool={tool}
              inWorkspace={true}
              position={placedTool.position}
              onPositionChange={updateToolPosition}
              connectionPoints={connectionPoints}
              onConnectionPointClick={handleConnectionPointClick}
              isConnectMode={isConnectMode}
              activeConnectionPoint={activeConnectionPoint}
            />
          );
        })}
        
        {/* Connection mode indicator */}
        {isConnectMode && (
          <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
            Connection Mode Active
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
