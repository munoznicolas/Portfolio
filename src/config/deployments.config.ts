export type DeploymentType = 'web' | 'extension' | 'desktop' | 'package';
export type DeploymentStatus = 'live' | 'preview' | 'local-only';

export interface AppDeployment {
  id: string;
  name: string;
  type: DeploymentType;
  status: DeploymentStatus;
  productionUrl?: string;
  demoUrl?: string;
  repositoryUrl: string;
  actionLabel?: string;
}

/**
 * Centralized deployment URLs and registry for all portfolio projects.
 * Supports environment variable overrides for CI/CD smoke tests and staging.
 */
export const DEPLOYMENTS: Record<string, AppDeployment> = {
  'omnilens': {
    id: 'omnilens',
    name: 'OmniLens',
    type: 'web',
    status: 'preview',
    productionUrl: process.env.URL_OMNILENS || 'https://omnilens.internal.dev',
    demoUrl: process.env.URL_OMNILENS || 'https://omnilens.internal.dev/scan',
    repositoryUrl: 'https://github.com/munoznicolas/LensClone-Frontend',
    actionLabel: 'Live App'
  },
  'cartas-politicas': {
    id: 'cartas-politicas',
    name: 'Cartas Políticas',
    type: 'web',
    status: 'preview',
    productionUrl: process.env.URL_CARTAS_POLITICAS || 'https://cartas-politicas.dev',
    demoUrl: process.env.URL_CARTAS_POLITICAS || 'https://cartas-politicas.dev',
    repositoryUrl: 'https://github.com/munoznicolas/CartasPoliticas-Frontend',
    actionLabel: 'Live Game'
  },
  'curriculahub': {
    id: 'curriculahub',
    name: 'CurriculaHub',
    type: 'web',
    status: 'preview',
    productionUrl: process.env.URL_CURRICULAHUB || 'https://curriculahub.app',
    demoUrl: process.env.URL_CURRICULAHUB || 'https://curriculahub.app',
    repositoryUrl: 'https://github.com/munoznicolas/OrganizadorCursada',
    actionLabel: 'Live Planner'
  },
  'smart-pantry': {
    id: 'smart-pantry',
    name: 'SmartPantry',
    type: 'extension',
    status: 'preview',
    productionUrl: process.env.URL_SMART_PANTRY || 'https://github.com/munoznicolas/carrefour-reposicion-extension/releases',
    demoUrl: process.env.URL_SMART_PANTRY || 'https://github.com/munoznicolas/carrefour-reposicion-extension/releases',
    repositoryUrl: 'https://github.com/munoznicolas/carrefour-reposicion-extension',
    actionLabel: 'Extension'
  },
  'ac-license-center': {
    id: 'ac-license-center',
    name: 'AC License Center',
    type: 'web',
    status: 'live',
    productionUrl: process.env.URL_AC_LICENSE_CENTER || 'https://github.com/munoznicolas/AssettoCorsa-GTLikeLicenses',
    demoUrl: process.env.URL_AC_LICENSE_CENTER_DESIGNER || 'https://munoznicolas.github.io/AssettoCorsa-GTLikeLicenses',
    repositoryUrl: 'https://github.com/munoznicolas/AssettoCorsa-GTLikeLicenses',
    actionLabel: 'Web Designer'
  },
  'bellview-intercom': {
    id: 'bellview-intercom',
    name: 'BellView Intercom',
    type: 'desktop',
    status: 'preview',
    productionUrl: process.env.URL_BELLVIEW || 'https://github.com/munoznicolas/bellview/releases',
    demoUrl: process.env.URL_BELLVIEW || 'https://github.com/munoznicolas/bellview/releases',
    repositoryUrl: 'https://github.com/munoznicolas/bellview',
    actionLabel: 'Download'
  },
  'ts2mermaid': {
    id: 'ts2mermaid',
    name: 'ts2mermaid',
    type: 'package',
    status: 'live',
    productionUrl: process.env.URL_TS2MERMAID || 'https://www.npmjs.com/package/ts2mermaid',
    demoUrl: process.env.URL_TS2MERMAID || 'https://www.npmjs.com/package/ts2mermaid',
    repositoryUrl: 'https://github.com/munoznicolas/tsTypes2umlBack',
    actionLabel: 'npm Package'
  }
};

/**
 * Returns active deployment URL for an app ID.
 */
export function getAppUrl(id: string): string | undefined {
  return DEPLOYMENTS[id]?.demoUrl || DEPLOYMENTS[id]?.productionUrl;
}
