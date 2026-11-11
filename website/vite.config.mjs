import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { projects, boothUrl } from './src/projects.js';

const escape = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const fallback = `<noscript><main class="no-script"><h1>misyaguziya’s Repository</h1><p>VRChat関連のソフトウェアとツールの集約ページです。</p><h2>Projects</h2>${projects.map(project => `<section><h3>${escape(project.name)}</h3><p>${escape(project.description)}</p><ul>${project.links.map(([label, href]) => `<li><a href="${escape(href)}">${escape(label)}</a></li>`).join('')}</ul></section>`).join('')}<h2>BOOTH</h2><p>配布しているソフトウェアの一覧です。</p><a href="${boothUrl}">BOOTH</a><p>misyaguziya — VRChat-related software and tools</p></main></noscript>`;

export default defineConfig({
  plugins: [react(), { name: 'portfolio-noscript', transformIndexHtml: html => html.replace('<!-- project-fallback -->', fallback) }],
  build: { outDir: 'dist', assetsDir: 'assets/portfolio' },
  server: { host: '127.0.0.1' },
});
