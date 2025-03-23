declare module 'matter-js' {
  export interface Engine {
    world: World;
  }
  
  export interface World {
    gravity: {
      x: number;
      y: number;
    };
    bodies: Body[];
  }
  
  export interface Body {
    position: {
      x: number;
      y: number;
    };
    render: {
      fillStyle: string;
    };
  }
  
  export interface Render {
    canvas: HTMLCanvasElement;
  }
  
  export interface Runner {}
  
  export interface RenderOptions {
    width: number;
    height: number;
    wireframes: boolean;
    background: string;
  }
  
  export interface BodyOptions {
    isStatic?: boolean;
    restitution?: number;
    friction?: number;
    render?: {
      fillStyle?: string;
    };
    angle?: number;
  }

  export namespace Engine {
    function create(): Engine;
    function clear(engine: Engine): void;
  }
  
  export namespace Render {
    function create(options: {
      element: HTMLElement;
      engine: Engine;
      options: RenderOptions;
    }): Render;
    function run(render: Render): void;
    function stop(render: Render): void;
  }
  
  export namespace Runner {
    function create(): Runner;
    function run(runner: Runner, engine: Engine): void;
    function stop(runner: Runner): void;
  }
  
  export namespace Bodies {
    function rectangle(x: number, y: number, width: number, height: number, options?: BodyOptions): Body;
    function circle(x: number, y: number, radius: number, options?: BodyOptions): Body;
  }
  
  export namespace Body {
    function setVelocity(body: Body, velocity: { x: number, y: number }): void;
  }
  
  export namespace Composite {
    function add(world: World, bodies: Body | Body[]): void;
  }
}