import { DEPLOYMENTS } from './deployments.config';

export interface ProjectCardConfig {
  id: string;
  title: string;
  pillar: 'architecture' | 'ai-multiplatform';
  order: number;
  image?: {
    src?: string;
    alt?: string;
  };
  video?: {
    src?: string;
    poster?: string;
  };
  demoUrl?: string;
  repositoryUrl?: string;
  actionLabel?: string;
  description: string;
  techStack: string[];
  caseStudyUrl?: string;
}

/**
 * Centralized Projects Configuration
 * 
 * Edit project cards displayed across the portfolio from here.
 * - title: Display name of the project
 * - image: Path to image or leave src empty/undefined to render the standardized placeholder
 * - description: 8-12 lines explaining what problem the project aims to solve and how
 * - techStack: List of technologies displayed as pill badges
 * - caseStudyUrl: Link to case study page
 */
const rawProjectsConfig: ProjectCardConfig[] = [
  // ==========================================
  // Pillar I: Featured Projects
  // ==========================================
  {
    id: 'omnilens',
    title: 'OmniLens',
    pillar: 'architecture',
    order: 1,
    image: {
      src: '/images/omnilens-preview.png',
      alt: 'OmniLens browser-native vision and spatial price intelligence',
    },
    video: {
      src: '/videos/omnilens.webm',
    },
    description: `Traditional retail price intelligence platforms rely on uploading continuous, high-bandwidth camera streams to centralized cloud servers for neural OCR and analysis. This architecture introduces prohibitive cloud compute expenses, latency bottlenecks, and significant user privacy risks.

OmniLens eliminates server streaming by running neural network inference locally inside the client browser using Web Workers and ONNX Runtime WebAssembly. By implementing reusable Float32Array tensor buffer pools, the vision pipeline achieves zero-GC memory allocation and consistent 30 FPS video throughput.

Extracted price observations and bounding boxes are dispatched to a high-throughput ASP.NET Core (.NET 10) backend. The service leverages PostgreSQL with PostGIS and NetTopologySuite to execute high-speed spatial proximity queries, surfacing localized retail price discrepancies in real time.`,
    techStack: ['Angular 22', 'ONNX Web (WASM)', 'ASP.NET Core (.NET 10)', 'PostgreSQL / PostGIS', 'NetTopologySuite', 'Docker'],
    caseStudyUrl: '/projects/omnilens',
  },
  {
    id: 'cartas-politicas',
    title: 'Cartas Políticas',
    pillar: 'architecture',
    order: 2,
    image: {
      src: '/images/cartas-preview.png',
      alt: 'Cartas Políticas real-time multiplayer card battler platform',
    },
    video: {
      src: '/videos/cartas.webm',
    },
    description: `Real-time multiplayer card games require deterministic turn loops, strict synchronization guarantees, and tamper-proof rule enforcement. In peer-to-peer or loosely coordinated client setups, concurrent player actions, unstable connections, and turn timers frequently produce desynchronized state anomalies.

Cartas Políticas solves this with an authoritative Backend-for-Frontend (BFF) architecture built with Node.js and TypeScript. A TSyringe dependency injection container enforces clear layer separation and isolates domain validation rules from presentation layers.

Card placements, damage calculations, and phase timers are evaluated entirely on the server and broadcast bidirectionally over Socket.io WebSockets. On the frontend, an Angular 18 Single Page Application driven by an immutable NgRx state machine guarantees deterministic visual rendering and seamless match state recovery upon reconnection.`,
    techStack: ['Angular 18', 'NgRx', 'Node.js / Express', 'TSyringe (IoC)', 'MongoDB', 'Socket.io', 'Jest'],
    caseStudyUrl: '/projects/cartas-politicas',
  },

  // ==========================================
  // Pillar II: Technical Explorations
  // ==========================================
  {
    id: 'ac-license-center',
    title: 'AC License Center',
    pillar: 'ai-multiplatform',
    order: 1,
    image: {
      src: '/images/ac-license-center-preview.png',
      alt: 'AC License Center Gran Turismo driving academy mod and test designer for Assetto Corsa',
    },
    video: {
      src: '/videos/ac-license-center.webm',
    },
    description: `Modern racing simulators such as Assetto Corsa feature sophisticated physics engines but lack structured, progressive driver development curricula reminiscent of classic simulators like Gran Turismo. Building this functionality natively is notoriously difficult due to undocumented C++ bindings in modding APIs, binary track spline formats, and the requirement for sub-second trial restarts without engine reloads.

AC License Center delivers a fully completed 5-tier driving school mod and event-driven runtime atop Custom Shaders Patch (CSP) Lua. The framework reverse-engineers binary .ai track splines to dynamically compute rolling-start gates, vector HUD ribbons, and real-time disqualification boundaries across 50+ challenges.

State resets execute in-memory in under 800ms without triggering 3D asset reloads. A headless Python math verification runner and interactive HTML5 Canvas spline designer accompany the production Content Manager drag-and-drop distribution package.`,
    techStack: ['Lua (CSP SDK)', 'Assetto Corsa Engine', 'Python 3', 'HTML5 Canvas', 'JSON Schema', 'Content Manager'],
    caseStudyUrl: '/projects/ac-license-center',
  },
  {
    id: 'bellview-intercom',
    title: 'BellView Intercom',
    pillar: 'ai-multiplatform',
    order: 2,
    image: {
      src: '/images/bellview-preview.png',
      alt: 'BellView Intercom native Windows 11 desktop client',
    },
    video: {
      src: '/videos/bellview.webm',
    },
    description: `Commercial IP door intercoms and video access systems overwhelmingly lock building occupants into proprietary mobile apps and push notification pipelines. When occupants are working at desktop workstations, mobile notifications are frequently delayed by mobile battery savers, missed entirely, or awkward to handle while multitasking.

BellView Intercom solves this by delivering a lightweight, native Windows 11 desktop client that integrates directly with door station hardware. Operating quietly in the system tray from system boot, the client handles SIP signaling to immediately open an early-media H.264 video feed upon a doorbell ring.

Occupants can visually identify visitors, establish low-latency bidirectional intercom audio, and safely trigger relay-driven electronic door strikes with a single keyboard shortcut or mouse click, all without relying on third-party cloud intermediaries.`,
    techStack: ['C# .NET 9', 'WPF / WinUI 3', 'SIP / VoIP (H.264)', 'DirectShow', 'Windows APIs'],
    caseStudyUrl: '/projects/bellview-intercom',
  },
  {
    id: 'curriculahub',
    title: 'CurriculaHub',
    pillar: 'ai-multiplatform',
    order: 3,
    image: {
      src: '/images/curriculahub-preview.png',
      alt: 'CurriculaHub academic degree planning platform',
    },
    video: {
      src: '/videos/curriculahub.webm',
    },
    description: `Navigating university degree curricula is notoriously confusing for students, as academic progression depends on complex prerequisite DAGs, strict corequisite rules, and semester-specific course offerings. Commercial schedule planners and university portals typically store sensitive student transcripts in proprietary clouds, offering rigid tabular interfaces that fail to visualize critical paths or prevent enrollment schedule overlaps.

CurriculaHub provides a modern, privacy-first academic trajectory manager built with Angular 21. It models university study plans as interactive dependency graphs, allowing students to visualize prerequisites and simulate future semesters dynamically.

A custom scheduling engine computes intersecting time vectors to identify timetable collisions and outputs exportable .ics calendar schedules. All student progress and degree data remains strictly within browser-local storage, ensuring complete personal data sovereignty without third-party tracking.`,
    techStack: ['Angular 21', 'TypeScript 5.8', 'SVG DAG Graphs', 'Tailwind CSS', 'IndexedDB / LocalStorage'],
    caseStudyUrl: '/projects/curriculahub',
  },
  {
    id: 'smart-pantry',
    title: 'SmartPantry',
    pillar: 'ai-multiplatform',
    order: 4,
    image: {
      src: '/images/smartpantry-preview.png',
      alt: 'SmartPantry Chrome extension grocery replenishment predictor',
    },
    video: {
      src: '/videos/smartpantry.webm',
    },
    description: `Modern e-commerce grocery platforms are designed around impulse purchasing rather than household inventory sustainability. Consumers repeatedly encounter stockouts of essential staples because estimating replenishment cadences across dozens of pantry categories is mentally demanding, while third-party grocery trackers require tedious manual item logging that users quickly abandon.

SmartPantry eliminates manual logging by operating as a privacy-preserving Chrome Manifest V3 extension integrated directly into Carrefour online accounts. Upon user authentication, background service workers securely parse past Order Management System receipts to calculate inter-purchase interval algorithms for each purchased item.

The extension predicts depletion dates, flags items nearing expiration, and auto-generates replenishment baskets before households run out. All analysis is persisted solely inside isolated chrome.storage.local, enforcing a zero-server privacy architecture.`,
    techStack: ['Chrome Extension (MV3)', 'Service Workers', 'JavaScript', 'chrome.storage.local', 'Web APIs'],
    caseStudyUrl: '/projects/smart-pantry',
  },
  {
    id: 'ts2mermaid',
    title: 'ts2mermaid',
    pillar: 'ai-multiplatform',
    order: 5,
    image: {
      src: '/images/ts2mermaid-preview.png',
      alt: 'ts2mermaid TypeScript AST compiler and Mermaid UML generator',
    },
    video: {
      src: '/videos/ts2mermaid.webm',
    },
    description: `Software architecture diagrams are essential for engineering communication, yet they degrade rapidly as codebases evolve because manual diagramming tools like draw.io or Lucidchart require continuous manual maintenance. Existing code-to-diagram generators often require bulky external runtime installations or struggle to parse modern TypeScript constructs like recursive generics, multi-interface heritage, and declaration merges.

ts2mermaid bridges this gap by directly tapping into the official TypeScript Compiler AST API. It recursively traverses source files to resolve token-level type declarations, class inheritance, interface extension, and method signatures into structured syntax trees.

These semantic models are then translated into standardized Mermaid UML class and sequence diagrams. Delivered both as an interactive developer CLI and an Express microservice, ts2mermaid allows engineering teams to automate diagram generation directly within CI/CD pipelines and documentation sites.`,
    techStack: ['TypeScript 5.5', 'Compiler API (AST)', 'Mermaid.js', 'Express', 'Commander CLI', 'Jest'],
    caseStudyUrl: '/projects/ts2mermaid',
  },
];

export const projectsConfig: ProjectCardConfig[] = rawProjectsConfig.map((p) => {
  const deployment = DEPLOYMENTS[p.id];
  return {
    ...p,
    demoUrl: p.demoUrl || deployment?.demoUrl || deployment?.productionUrl,
    repositoryUrl: p.repositoryUrl || deployment?.repositoryUrl,
    actionLabel: p.actionLabel || deployment?.actionLabel,
  };
});

export const featuredProjects = projectsConfig
  .filter((p) => p.pillar === 'architecture')
  .sort((a, b) => a.order - b.order);

export const engineeringProjects = featuredProjects;

export const crossPlatformProjects = projectsConfig
  .filter((p) => p.pillar === 'ai-multiplatform')
  .sort((a, b) => a.order - b.order);
