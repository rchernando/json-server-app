import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Server },
  { path: 'es/login', renderMode: RenderMode.Server },

  { path: '', renderMode: RenderMode.Server },
  { path: 'posts/new', renderMode: RenderMode.Server },
  { path: 'posts/:id', renderMode: RenderMode.Server },
  { path: 'posts/:id/edit', renderMode: RenderMode.Server },
  { path: 'forbidden', renderMode: RenderMode.Server },

  { path: 'es', renderMode: RenderMode.Server },
  { path: 'es/posts/new', renderMode: RenderMode.Server },
  { path: 'es/posts/:id', renderMode: RenderMode.Server },
  { path: 'es/posts/:id/edit', renderMode: RenderMode.Server },
  { path: 'es/forbidden', renderMode: RenderMode.Server },

  { path: '**', renderMode: RenderMode.Server },
];
