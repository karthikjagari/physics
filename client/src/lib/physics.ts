import Matter from 'matter-js';
import { Experiment, SimulationResult, Tool, Connection } from '@shared/schema';

interface PlacedTool {
  id: number;
  position: { x: number, y: number };
  tool?: Tool; // The tool object
}

// Store the engine and world for cleanup
let engine: Matter.Engine | null = null;
let renderer: Matter.Render | null = null;
let runner: Matter.Runner | null = null;

// Set up physics simulation based on experiment type
export function setupMatterSimulation(
  container: HTMLElement, 
  placedTools: PlacedTool[], 
  experiment: Experiment,
  connections: Connection[] = [],
  onComplete: (results: SimulationResult) => void
): () => void {
  // Clear any existing simulation
  cleanupMatterSimulation();
  
  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  // Create engine
  engine = Matter.Engine.create();
  
  // Create renderer
  renderer = Matter.Render.create({
    element: container,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: '#f5f5f5'
    }
  });
  
  // Create runner
  runner = Matter.Runner.create();
  
  // Create world bounds
  const ground = Matter.Bodies.rectangle(width / 2, height - 10, width, 20, { 
    isStatic: true,
    render: { fillStyle: '#424242' }
  });
  
  const leftWall = Matter.Bodies.rectangle(0, height / 2, 20, height, { 
    isStatic: true,
    render: { fillStyle: '#424242' }
  });
  
  const rightWall = Matter.Bodies.rectangle(width, height / 2, 20, height, { 
    isStatic: true,
    render: { fillStyle: '#424242' }
  });
  
  const ceiling = Matter.Bodies.rectangle(width / 2, 0, width, 20, { 
    isStatic: true,
    render: { fillStyle: '#424242' }
  });
  
  // Add bounds to world
  Matter.Composite.add(engine.world, [ground, leftWall, rightWall, ceiling]);
  
  // Set up experiment-specific physics
  let simulationDuration = 5000; // Default 5 seconds
  let timeElapsed = 0;
  let simulationData: any = {};
  
  switch (experiment.type) {
    case 'electric-circuits':
      simulationData = setupElectricCircuitSimulation(engine.world, placedTools, width, height, connections);
      simulationDuration = 3000;
      break;
      
    case 'free-fall':
      simulationData = setupFreeFallSimulation(engine.world, placedTools, width, height);
      simulationDuration = 4000;
      break;
      
    case 'projectile-motion':
      simulationData = setupProjectileMotionSimulation(engine.world, placedTools, width, height);
      simulationDuration = 5000;
      break;
      
    default:
      // Generic setup
      placedTools.forEach(placedTool => {
        const { position } = placedTool;
        const body = Matter.Bodies.circle(position.x, position.y, 20, {
          render: { fillStyle: '#FF5722' }
        });
        if (engine) Matter.Composite.add(engine.world, body);
      });
      break;
  }
  
  // Run the simulation
  if (renderer) Matter.Render.run(renderer);
  if (runner && engine) Matter.Runner.run(runner, engine);
  
  // Generate results based on experiment type after simulation duration
  setTimeout(() => {
    const results = generateSimulationResults(experiment.type, simulationData);
    
    // Send results back
    onComplete(results);
    
    // Optional: keep the simulation running or stop it
    // cleanupMatterSimulation();
  }, simulationDuration);
  
  // Return cleanup function
  return cleanupMatterSimulation;
}

// Clean up Matter.js instances
export function cleanupMatterSimulation() {
  if (runner) {
    Matter.Runner.stop(runner);
    runner = null;
  }
  
  if (renderer) {
    Matter.Render.stop(renderer);
    renderer.canvas.remove();
    renderer = null;
  }
  
  if (engine) {
    Matter.Engine.clear(engine);
    engine = null;
  }
}

// Setup for electric circuit simulation
function setupElectricCircuitSimulation(world: Matter.World, placedTools: PlacedTool[], width: number, height: number, connections: Connection[] = []) {
  // In a real implementation, this would create visual representations of circuits
  // and simulate electrical behavior
  
  // Get tool positions by type
  const batteries = placedTools.filter(pt => pt.tool?.type === 'battery');
  const resistors = placedTools.filter(pt => pt.tool?.type === 'resistor');
  const wires = placedTools.filter(pt => pt.tool?.type === 'wire');
  const bulbs = placedTools.filter(pt => pt.tool?.type === 'bulb');
  
  // Create bodies for each component
  const componentBodies: { [key: string]: Matter.Body } = {};
  
  // Add battery visualization
  batteries.forEach(battery => {
    const body = Matter.Bodies.rectangle(battery.position.x, battery.position.y, 40, 20, {
      isStatic: true,
      render: { fillStyle: '#FF5722' }
    });
    componentBodies[`tool-${battery.id}`] = body;
    Matter.Composite.add(world, body);
  });
  
  // Add resistor visualization
  resistors.forEach(resistor => {
    const body = Matter.Bodies.rectangle(resistor.position.x, resistor.position.y, 30, 10, {
      isStatic: true,
      render: { fillStyle: '#3949AB' }
    });
    componentBodies[`tool-${resistor.id}`] = body;
    Matter.Composite.add(world, body);
  });
  
  // Add bulb visualization
  bulbs.forEach(bulb => {
    const body = Matter.Bodies.circle(bulb.position.x, bulb.position.y, 15, {
      isStatic: true,
      render: { fillStyle: '#FFEB3B' }
    });
    componentBodies[`tool-${bulb.id}`] = body;
    Matter.Composite.add(world, body);
  });
  
  // Add wire visualization
  wires.forEach(wire => {
    const body = Matter.Bodies.rectangle(wire.position.x, wire.position.y, 40, 5, {
      isStatic: true,
      render: { fillStyle: '#424242' }
    });
    componentBodies[`tool-${wire.id}`] = body;
    Matter.Composite.add(world, body);
  });
  
  // Add connections as constraints between components
  connections.forEach(connection => {
    // Find the source and target tools
    const sourceTool = placedTools.find(t => t.id === connection.sourceTool);
    const targetTool = placedTools.find(t => t.id === connection.targetTool);
    
    if (!sourceTool || !targetTool) return;
    
    // Get the bodies for these tools
    const sourceBody = componentBodies[`tool-${sourceTool.id}`];
    const targetBody = componentBodies[`tool-${targetTool.id}`];
    
    if (!sourceBody || !targetBody) return;
    
    // Create a visual connection (a thin line)
    const connectionLine = Matter.Bodies.rectangle(
      (sourceTool.position.x + targetTool.position.x) / 2,
      (sourceTool.position.y + targetTool.position.y) / 2,
      Math.hypot(targetTool.position.x - sourceTool.position.x, targetTool.position.y - sourceTool.position.y),
      2,
      {
        isStatic: true,
        angle: Math.atan2(targetTool.position.y - sourceTool.position.y, targetTool.position.x - sourceTool.position.x),
        render: { fillStyle: '#4CAF50' }
      }
    );
    
    Matter.Composite.add(world, connectionLine);
    
    // If this is a battery connected to a bulb, make the bulb glow
    if (
      (sourceTool.tool?.type === 'battery' && targetTool.tool?.type === 'bulb') ||
      (sourceTool.tool?.type === 'bulb' && targetTool.tool?.type === 'battery')
    ) {
      // Find the bulb body
      const bulbBody = sourceTool.tool?.type === 'bulb' 
        ? componentBodies[`tool-${sourceTool.id}`]
        : componentBodies[`tool-${targetTool.id}`];
      
      if (bulbBody) {
        // Make the bulb "glow" by changing its color
        bulbBody.render.fillStyle = '#FFC107';
        
        // Add a glow effect (a larger circle behind it)
        const glowEffect = Matter.Bodies.circle(
          bulbBody.position.x,
          bulbBody.position.y,
          25,
          {
            isStatic: true,
            render: { 
              fillStyle: 'rgba(255, 235, 59, 0.3)' 
            }
          }
        );
        
        // Make sure the glow is behind the bulb
        Matter.Composite.add(world, glowEffect);
      }
    }
  });
  
  return {
    components: placedTools,
    connections: connections
  };
}

// Setup for free fall simulation
function setupFreeFallSimulation(world: Matter.World, placedTools: PlacedTool[], width: number, height: number) {
  // Find the ball and height selector
  const ballPos = placedTools.find(pt => pt.tool?.type === 'ball')?.position;
  const heightSelectorPos = placedTools.find(pt => pt.tool?.type === 'height-selector')?.position;
  
  if (!ballPos) return { startTime: Date.now() };
  
  // Set initial height based on height selector or default to a high position
  const initialHeight = heightSelectorPos ? heightSelectorPos.y : 50;
  
  // Create the ball
  const ball = Matter.Bodies.circle(ballPos.x, initialHeight, 15, {
    restitution: 0.8,
    render: { fillStyle: '#FF5722' }
  });
  
  Matter.Composite.add(world, ball);
  
  // Set gravity for the simulation (default is 1)
  world.gravity.y = 0.98;
  
  // Return data for result calculation
  return {
    startTime: Date.now(),
    initialHeight,
    ball
  };
}

// Setup for projectile motion simulation
function setupProjectileMotionSimulation(world: Matter.World, placedTools: PlacedTool[], width: number, height: number) {
  // Find launcher, projectile, and angle
  const launcherPos = placedTools.find(pt => pt.tool?.type === 'launcher')?.position;
  const projectilePos = placedTools.find(pt => pt.tool?.type === 'projectile')?.position;
  const angleSelectorPos = placedTools.find(pt => pt.tool?.type === 'angle-selector')?.position;
  const velocityControlPos = placedTools.find(pt => pt.tool?.type === 'velocity-control')?.position;
  
  if (!launcherPos) return { startTime: Date.now() };
  
  // Set launch properties
  const launchX = launcherPos.x;
  const launchY = height - 30; // Launch from near ground level
  
  // Determine angle (default 45 degrees)
  const angle = angleSelectorPos ? 
    (Math.atan2(angleSelectorPos.y - launchY, angleSelectorPos.x - launchX) * (180/Math.PI) + 180) % 180 : 
    45;
  
  // Determine velocity (default 10)
  const velocity = velocityControlPos ? 
    Math.min(20, Math.max(5, velocityControlPos.x / 50)) : 
    10;
  
  // Create launcher
  const launcher = Matter.Bodies.rectangle(launchX, launchY, 40, 20, {
    isStatic: true,
    render: { fillStyle: '#3949AB' }
  });
  
  // Create projectile
  const projectile = Matter.Bodies.circle(launchX, launchY - 20, 10, {
    restitution: 0.8,
    friction: 0.05,
    render: { fillStyle: '#FF5722' }
  });
  
  // Convert angle to radians
  const angleRad = angle * (Math.PI / 180);
  
  // Apply force to launch projectile
  Matter.Body.setVelocity(projectile, {
    x: velocity * Math.cos(angleRad),
    y: -velocity * Math.sin(angleRad)
  });
  
  Matter.Composite.add(world, [launcher, projectile]);
  
  // Return data for result calculation
  return {
    startTime: Date.now(),
    angle,
    velocity,
    projectile,
    launchX,
    launchY
  };
}

// Generate results based on the experiment type and simulation data
function generateSimulationResults(experimentType: string, simulationData: any): SimulationResult {
  switch (experimentType) {
    case 'electric-circuits':
      return {
        measurements: [
          { label: 'Voltage', value: '9.0', unit: 'V' },
          { label: 'Current', value: '0.5', unit: 'A' },
          { label: 'Resistance', value: '18.0', unit: 'Ω' },
          { label: 'Power', value: '4.5', unit: 'W' }
        ],
        graphTitle: 'Voltage vs. Current Graph',
        graphData: [
          { x: 0, y: 0 },
          { x: 3, y: 0.167 },
          { x: 6, y: 0.333 },
          { x: 9, y: 0.5 }
        ]
      };
      
    case 'free-fall':
      return {
        measurements: [
          { label: 'Drop Height', value: '10.0', unit: 'm' },
          { label: 'Time of Fall', value: '1.43', unit: 's' },
          { label: 'Final Velocity', value: '14.0', unit: 'm/s' },
          { label: 'Calculated g', value: '9.79', unit: 'm/s²' }
        ],
        graphTitle: 'Position vs. Time Graph',
        graphData: [
          { x: 0, y: 0 },
          { x: 0.5, y: 1.22 },
          { x: 1.0, y: 4.9 },
          { x: 1.43, y: 10.0 }
        ]
      };
      
    case 'projectile-motion':
      const angle = simulationData.angle || 45;
      const velocity = simulationData.velocity || 10;
      
      // Calculate basic projectile motion values
      const g = 9.8; // m/s²
      const timeOfFlight = (2 * velocity * Math.sin(angle * Math.PI / 180)) / g;
      const maxHeight = (velocity * Math.sin(angle * Math.PI / 180)) ** 2 / (2 * g);
      const range = (velocity ** 2 * Math.sin(2 * angle * Math.PI / 180)) / g;
      
      return {
        measurements: [
          { label: 'Launch Angle', value: angle.toFixed(1), unit: '°' },
          { label: 'Initial Velocity', value: velocity.toFixed(1), unit: 'm/s' },
          { label: 'Maximum Height', value: maxHeight.toFixed(1), unit: 'm' },
          { label: 'Horizontal Range', value: range.toFixed(1), unit: 'm' },
          { label: 'Time of Flight', value: timeOfFlight.toFixed(2), unit: 's' }
        ],
        graphTitle: 'Projectile Trajectory',
        graphData: Array.from({ length: 10 }).map((_, i) => {
          const t = (i / 9) * timeOfFlight;
          return {
            x: velocity * Math.cos(angle * Math.PI / 180) * t,
            y: velocity * Math.sin(angle * Math.PI / 180) * t - 0.5 * g * t * t
          };
        })
      };
      
    default:
      return {
        measurements: [
          { label: 'Result', value: 'Generic simulation complete', unit: '' }
        ]
      };
  }
}
