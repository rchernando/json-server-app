import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

const loadLayout = () =>
  import('./modules/_layout/layout').then((module) => module.LayoutComponent);
const loadPosts = () => import('./modules/posts/posts').then((module) => module.PostsComponent);
const loadPostDetail = () =>
  import('./modules/posts/components/post-detail').then((module) => module.PostDetailComponent);
const loadNewPost = () =>
  import('./modules/posts/pages/new-post').then((module) => module.NewPostComponent);
const loadLogin = () =>
  import('./modules/auth/pages/login').then((module) => module.LoginComponent);
const loadForbidden = () =>
  import('./shared/components/forbidden').then((module) => module.ForbiddenComponent);
const loadNotFound = () =>
  import('./shared/components/not-found').then((module) => module.NotFoundComponent);

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: loadLogin,
  },
  {
    path: 'es/login',
    canMatch: [guestGuard],
    loadComponent: loadLogin,
  },
  {
    path: '',
    canMatch: [authGuard],
    loadComponent: loadLayout,
    children: [
      { path: '', loadComponent: loadPosts },
      { path: 'posts/new', loadComponent: loadNewPost },
      { path: 'posts/:id', loadComponent: loadPostDetail },
      { path: 'posts/:id/edit', loadComponent: loadNewPost },
      { path: 'forbidden', loadComponent: loadForbidden },
      { path: 'es', loadComponent: loadPosts },
      { path: 'es/posts/new', loadComponent: loadNewPost },
      { path: 'es/posts/:id', loadComponent: loadPostDetail },
      { path: 'es/posts/:id/edit', loadComponent: loadNewPost },
      { path: 'es/forbidden', loadComponent: loadForbidden },
      { path: '**', loadComponent: loadNotFound },
    ],
  },
];
