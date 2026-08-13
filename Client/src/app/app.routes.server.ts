import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Short codes are created at runtime, so this can't be prerendered
    // ahead of time — render it on each request instead.
    path: 'link/:shortCode',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
