import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from 'zod';
import { insertExperimentSchema, insertToolSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/experiments', async (req: Request, res: Response) => {
    try {
      const experiments = await storage.getExperiments();
      res.json(experiments);
    } catch (error) {
      console.error("Error fetching experiments:", error);
      res.status(500).json({ message: 'Failed to fetch experiments' });
    }
  });

  app.get('/api/experiments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid experiment ID' });
      }
      
      const experiment = await storage.getExperiment(id);
      if (!experiment) {
        return res.status(404).json({ message: 'Experiment not found' });
      }
      
      res.json(experiment);
    } catch (error) {
      console.error("Error fetching experiment:", error);
      res.status(500).json({ message: 'Failed to fetch experiment' });
    }
  });

  app.get('/api/experiments/:id/tools', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid experiment ID' });
      }
      
      const tools = await storage.getToolsByExperiment(id);
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools for experiment:", error);
      res.status(500).json({ message: 'Failed to fetch tools' });
    }
  });

  app.post('/api/experiments', async (req: Request, res: Response) => {
    try {
      const validatedData = insertExperimentSchema.parse(req.body);
      const experiment = await storage.createExperiment(validatedData);
      res.status(201).json(experiment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid experiment data', errors: error.errors });
      }
      console.error("Error creating experiment:", error);
      res.status(500).json({ message: 'Failed to create experiment' });
    }
  });

  app.post('/api/tools', async (req: Request, res: Response) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(validatedData);
      res.status(201).json(tool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid tool data', errors: error.errors });
      }
      console.error("Error creating tool:", error);
      res.status(500).json({ message: 'Failed to create tool' });
    }
  });

  // Initialize demo data if environment is development
  if (process.env.NODE_ENV !== 'production') {
    initializeDemoData();
  }

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize demo data for development
async function initializeDemoData() {
  try {
    // Check if data already exists
    const existingExperiments = await storage.getExperiments();
    if (existingExperiments.length > 0) {
      console.log("Demo data already initialized, skipping...");
      return;
    }

    console.log("Initializing demo data...");

    // 1. Electric Circuits Experiment
    const electricCircuits = await storage.createExperiment({
      title: "Electric Circuits",
      description: "Build and analyze simple and complex electrical circuits, measure current, voltage and resistance.",
      type: "electric-circuits",
      category: "Physics",
      imageUrl: "https://images.unsplash.com/photo-1620428268482-cf1851a36764?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=D2monVkCkX4",
      instructions: `
        <ol class="list-decimal pl-5 space-y-2">
          <li>Drag the battery, wires, resistors, and bulb to the workspace.</li>
          <li>Connect the components to form a complete circuit.</li>
          <li>Use the multimeter to measure voltage and current at different points.</li>
          <li>Click "Run Simulation" to see the circuit in action.</li>
          <li>Observe how changing resistance affects current flow.</li>
        </ol>
      `,
      theory: `
        <p class="mb-2">Electric circuits follow Ohm's Law: V = IR, where V is voltage, I is current, and R is resistance.</p>
        <p class="mb-2">Series circuits have components connected end-to-end, with the same current flowing through each component.</p>
        <p>Parallel circuits have components connected across the same voltage source, with current divided among the branches.</p>
      `,
      requiredTools: ["battery", "resistor", "wire", "bulb"]
    });

    // Electric Circuit Tools
    await storage.createTool({
      name: "Battery",
      type: "battery",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1187/1187625.png",
      experimentId: electricCircuits.id,
      properties: { voltage: 9 }
    });
    await storage.createTool({
      name: "Resistor",
      type: "resistor",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2861/2861444.png",
      experimentId: electricCircuits.id,
      properties: { resistance: 100 }
    });
    await storage.createTool({
      name: "Wire",
      type: "wire",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2231/2231353.png",
      experimentId: electricCircuits.id,
      properties: {}
    });
    await storage.createTool({
      name: "Bulb",
      type: "bulb",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/702/702797.png",
      experimentId: electricCircuits.id,
      properties: { resistance: 20 }
    });
    await storage.createTool({
      name: "Switch",
      type: "switch",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2516/2516688.png",
      experimentId: electricCircuits.id,
      properties: { state: "open" }
    });
    await storage.createTool({
      name: "Ammeter",
      type: "ammeter",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1940/1940611.png",
      experimentId: electricCircuits.id,
      properties: {}
    });
    await storage.createTool({
      name: "Voltmeter",
      type: "voltmeter",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2421/2421989.png",
      experimentId: electricCircuits.id,
      properties: {}
    });
    await storage.createTool({
      name: "Capacitor",
      type: "capacitor",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2821/2821739.png",
      experimentId: electricCircuits.id,
      properties: { capacitance: 10 }
    });

    // 2. Free Fall Motion Experiment
    const freeFall = await storage.createExperiment({
      title: "Free Fall Motion",
      description: "Study gravity's effect on objects, measure acceleration, and analyze time-distance relationships.",
      type: "free-fall",
      category: "Physics",
      imageUrl: "https://images.unsplash.com/photo-1536566482680-fca31930a0bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=E43-CfukEgs",
      instructions: `
        <ol class="list-decimal pl-5 space-y-2">
          <li>Drag the object, timer, and measuring tools to the workspace.</li>
          <li>Set the initial height of the object using the height selector.</li>
          <li>Click "Run Simulation" to drop the object.</li>
          <li>Observe the time it takes for the object to reach the ground.</li>
          <li>Calculate the acceleration due to gravity based on the distance and time.</li>
        </ol>
      `,
      theory: `
        <p class="mb-2">Objects in free fall experience a constant acceleration due to gravity (g ≈ 9.8 m/s²).</p>
        <p class="mb-2">The distance traveled can be calculated using: d = 0.5 × g × t², where t is time.</p>
        <p>In the absence of air resistance, all objects fall at the same rate regardless of mass.</p>
      `,
      requiredTools: ["ball", "timer", "height-selector"]
    });

    // Free Fall Tools
    await storage.createTool({
      name: "Ball",
      type: "ball",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3106/3106721.png",
      experimentId: freeFall.id,
      properties: { mass: 0.1 }
    });
    await storage.createTool({
      name: "Timer",
      type: "timer",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972531.png",
      experimentId: freeFall.id,
      properties: {}
    });
    await storage.createTool({
      name: "Ruler",
      type: "ruler",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3655/3655580.png",
      experimentId: freeFall.id,
      properties: {}
    });
    await storage.createTool({
      name: "Height Selector",
      type: "height-selector",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/5073/5073415.png",
      experimentId: freeFall.id,
      properties: {}
    });
    await storage.createTool({
      name: "Air Resistance Control",
      type: "air-resistance",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2947/2947988.png",
      experimentId: freeFall.id,
      properties: { resistance: 0 }
    });
    await storage.createTool({
      name: "Mass Adjuster",
      type: "mass-adjuster",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3585/3585267.png",
      experimentId: freeFall.id,
      properties: {}
    });

    // 3. Projectile Motion Experiment
    const projectileMotion = await storage.createExperiment({
      title: "Projectile Motion",
      description: "Explore how objects move through air, adjust launch angles and initial velocity to observe trajectories.",
      type: "projectile-motion",
      category: "Physics",
      imageUrl: "https://images.unsplash.com/photo-1609743522653-52354461eb27?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      videoUrl: "https://www.youtube.com/watch?v=376aw-shqWY",
      instructions: `
        <ol class="list-decimal pl-5 space-y-2">
          <li>Drag the launcher, projectile, and measuring tools to the workspace.</li>
          <li>Set the launch angle using the angle selector.</li>
          <li>Adjust the initial velocity with the velocity control.</li>
          <li>Click "Run Simulation" to launch the projectile.</li>
          <li>Track the trajectory and measure the maximum height and distance.</li>
        </ol>
      `,
      theory: `
        <p class="mb-2">Projectile motion combines horizontal motion at constant velocity and vertical motion with constant acceleration.</p>
        <p class="mb-2">The horizontal distance (range) is given by: R = (v² × sin(2θ)) / g, where v is initial velocity and θ is launch angle.</p>
        <p>The maximum height is given by: h = (v² × sin²θ) / (2g).</p>
      `,
      requiredTools: ["launcher", "projectile", "angle-selector", "velocity-control"]
    });

    // Projectile Motion Tools
    await storage.createTool({
      name: "Launcher",
      type: "launcher",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3242/3242257.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Projectile",
      type: "projectile",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2582/2582156.png",
      experimentId: projectileMotion.id,
      properties: { mass: 0.1 }
    });
    await storage.createTool({
      name: "Angle Selector",
      type: "angle-selector",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2178/2178618.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Velocity Control",
      type: "velocity-control",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Timer",
      type: "timer",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/2972/2972531.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Distance Meter",
      type: "distance-meter",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/1250/1250695.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Height Meter",
      type: "height-meter",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/3079/3079012.png",
      experimentId: projectileMotion.id,
      properties: {}
    });
    await storage.createTool({
      name: "Wind Control",
      type: "wind-control",
      iconUrl: "https://cdn-icons-png.flaticon.com/512/959/959711.png",
      experimentId: projectileMotion.id,
      properties: { speed: 0, direction: 0 }
    });

    console.log("Demo data initialization complete!");
  } catch (error) {
    console.error("Error initializing demo data:", error);
  }
}
