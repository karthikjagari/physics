import { 
  Experiment, 
  InsertExperiment,
  Tool,
  InsertTool,
  User, 
  InsertUser 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Experiment operations
  getExperiments(): Promise<Experiment[]>;
  getExperiment(id: number): Promise<Experiment | undefined>;
  createExperiment(experiment: InsertExperiment): Promise<Experiment>;
  
  // Tool operations
  getToolsByExperiment(experimentId: number): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private experiments: Map<number, Experiment>;
  private tools: Map<number, Tool>;
  
  private userCurrentId: number;
  private experimentCurrentId: number;
  private toolCurrentId: number;

  constructor() {
    this.users = new Map();
    this.experiments = new Map();
    this.tools = new Map();
    
    this.userCurrentId = 1;
    this.experimentCurrentId = 1;
    this.toolCurrentId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Experiment operations
  async getExperiments(): Promise<Experiment[]> {
    return Array.from(this.experiments.values());
  }
  
  async getExperiment(id: number): Promise<Experiment | undefined> {
    return this.experiments.get(id);
  }
  
  async createExperiment(insertExperiment: InsertExperiment): Promise<Experiment> {
    const id = this.experimentCurrentId++;
    // Ensure required fields are present and handle optional fields correctly
    const experiment: Experiment = { 
      ...insertExperiment, 
      id,
      imageUrl: insertExperiment.imageUrl || null,
      videoUrl: insertExperiment.videoUrl || null,
      requiredTools: insertExperiment.requiredTools || null
    };
    this.experiments.set(id, experiment);
    return experiment;
  }
  
  // Tool operations
  async getToolsByExperiment(experimentId: number): Promise<Tool[]> {
    return Array.from(this.tools.values()).filter(
      (tool) => tool.experimentId === experimentId
    );
  }
  
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }
  
  async createTool(insertTool: InsertTool): Promise<Tool> {
    const id = this.toolCurrentId++;
    // Ensure properties field is present
    const tool: Tool = { 
      ...insertTool, 
      id,
      properties: insertTool.properties || {}
    };
    this.tools.set(id, tool);
    return tool;
  }
}

export const storage = new MemStorage();
