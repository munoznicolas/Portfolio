import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://munoznicolas.github.io',
  base: '/Portfolio',
  integrations: [mdx()],
  redirects: {
    '/projects/apex-license': '/projects/ac-license-center',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
