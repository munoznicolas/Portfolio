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
  roleTitle: "Software Developer",
  headline: "Building reliable systems and exploring what AI makes possible.",
  bio: "I build backend services, distributed applications, and practical AI-powered tools. From production systems in Go and .NET to browser-based computer vision, I focus on solving engineering problems with maintainable software.",
  githubUrl: "https://github.com/munoznicolas",
  linkedinUrl: "https://www.linkedin.com/in/nicolasarielmunoz",
  email: "munoz_nicolas@hotmail.com",
  repoBaseUrl: "https://github.com/munoznicolas",
};
