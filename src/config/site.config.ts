export interface SiteConfig {
  authorName: string;
  roleTitle: string;
  headline: string;
  bio: string;
  githubUrl: string;
  linkedinUrl: string;
  email: string;
  repoBaseUrl: string;
}

export const siteConfig: SiteConfig = {
  authorName: "Nicolas Muñoz",
  roleTitle: "Senior Fullstack & Systems Architect",
  headline: "Architecting Resilient Distributed Systems — Accelerated by Autonomous AI Agents",
  bio: "Senior engineer focused on clean distributed architectures, browser-edge computer vision, and reactive state machines. Leveraging AI agents to rapidly execute across low-level native systems, niche game runtimes, and compiler toolchains.",
  githubUrl: "https://github.com/munoznicolas",
  linkedinUrl: "https://linkedin.com/in/nicolas-munoz",
  email: "munoz_nicolas@hotmail.com",
  repoBaseUrl: "https://github.com/munoznicolas",
};
