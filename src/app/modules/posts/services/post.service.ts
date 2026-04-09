import { inject, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap, take } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

export interface PostFilters {
  search?: string;
  userId?: number;
  tagId?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedPosts {
  items: Post[];
  total: number;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PostTagJoin {
  id: number;
  postId: number;
  tagId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface PostTag extends PostTagJoin {
  tag?: Tag;
}

interface RawPost {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  user?: User;
  postTags?: PostTagJoin[];
}

export interface Post extends Omit<RawPost, 'postTags'> {
  postTags?: PostTag[];
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  createdAt?: string;
  user?: User;
}

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class PostService {
  private http = inject(HttpClient);
  private tagsCache = signal<Tag[] | null>(null);
  private tags$ = toObservable(this.tagsCache).pipe(
    filter((tags): tags is Tag[] => tags !== null),
    take(1),
  );

  constructor() {
    this.http.get<Tag[]>(`${API}/tags`).subscribe({
      next: (tags) => this.tagsCache.set(tags),
      error: () => this.tagsCache.set([]),
    });
  }

  private enrichPost(post: RawPost): Post {
    const tags = this.tagsCache() ?? [];
    return {
      ...post,
      postTags: (post.postTags ?? []).map((pt) => ({
        ...pt,
        tag: tags.find((t) => t.id === pt.tagId),
      })),
    };
  }

  getPosts(filters?: PostFilters): Observable<PaginatedPosts> {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 10;

    if (filters?.tagId) {
      return this.getPostsByTag(filters, page, pageSize);
    }

    let params = new HttpParams()
      .set('_expand', 'user')
      .set('_embed', 'postTags')
      .set('_page', String(page))
      .set('_limit', String(pageSize))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');

    if (filters?.search) params = params.set('q', filters.search);
    if (filters?.userId) params = params.set('userId', String(filters.userId));

    return this.http
      .get<RawPost[]>(`${API}/posts`, { params, observe: 'response' })
      .pipe(
        map((response) => ({
          items: (response.body ?? []).map((p) => this.enrichPost(p)),
          total: Number(response.headers.get('X-Total-Count') ?? 0),
        })),
      );
  }

  private getPostsByTag(
    filters: PostFilters,
    page: number,
    pageSize: number,
  ): Observable<PaginatedPosts> {
    return this.http.get<PostTagJoin[]>(`${API}/postTags?tagId=${filters.tagId}`).pipe(
      switchMap((joins) => {
        const postIds = joins.map((j) => j.postId);
        if (postIds.length === 0) {
          return of({ items: [] as Post[], total: 0 });
        }

        return forkJoin(
          postIds.map((id) =>
            this.http.get<RawPost>(`${API}/posts/${id}?_expand=user&_embed=postTags`),
          ),
        ).pipe(
          map((posts) => {
            let result = posts.map((p) => this.enrichPost(p));

            if (filters.userId) {
              result = result.filter((p) => p.userId === filters.userId);
            }
            if (filters.search) {
              const term = filters.search.toLowerCase();
              result = result.filter(
                (p) =>
                  p.title.toLowerCase().includes(term) ||
                  p.content.toLowerCase().includes(term),
              );
            }

            result.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );

            const start = (page - 1) * pageSize;
            return { items: result.slice(start, start + pageSize), total: result.length };
          }),
        );
      }),
    );
  }

  getPostById(id: string): Observable<Post> {
    return this.http
      .get<RawPost>(`${API}/posts/${id}?_expand=user&_embed=postTags`)
      .pipe(map((post) => this.enrichPost(post)));
  }

  deletePost(id: number | string): Observable<void> {
    return this.http.delete<void>(`${API}/posts/${id}`);
  }

  updatePost(
    id: number | string,
    changes: { title: string; content: string; tagIds: number[] },
  ): Observable<Post> {
    return this.http
      .patch<RawPost>(`${API}/posts/${id}`, {
        title: changes.title,
        content: changes.content,
      })
      .pipe(
        switchMap(() => this.http.get<PostTagJoin[]>(`${API}/postTags?postId=${id}`)),
        switchMap((existing) => {
          if (existing.length === 0) return of([]);
          return forkJoin(
            existing.map((pt) => this.http.delete<void>(`${API}/postTags/${pt.id}`)),
          );
        }),
        switchMap(() => {
          if (changes.tagIds.length === 0) return of([]);
          return forkJoin(
            changes.tagIds.map((tagId) =>
              this.http.post<PostTagJoin>(`${API}/postTags`, {
                postId: Number(id),
                tagId,
              }),
            ),
          );
        }),
        switchMap(() => this.getPostById(String(id))),
      );
  }

  createPost(input: {
    userId: number;
    title: string;
    content: string;
    tagIds: number[];
  }): Observable<Post> {
    const body = {
      userId: input.userId,
      title: input.title,
      content: input.content,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<RawPost>(`${API}/posts`, body).pipe(
      switchMap((post) => {
        if (input.tagIds.length === 0) return of(post);
        return forkJoin(
          input.tagIds.map((tagId) =>
            this.http.post<PostTagJoin>(`${API}/postTags`, {
              postId: post.id,
              tagId,
            }),
          ),
        ).pipe(map((postTags) => ({ ...post, postTags })));
      }),
      map((post) => this.enrichPost(post as RawPost)),
    );
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(
      `${API}/comments?postId=${postId}&_expand=user&_sort=id&_order=asc`,
    );
  }

  createComment(input: {
    postId: number;
    userId: number;
    content: string;
  }): Observable<Comment> {
    return this.http.post<Comment>(`${API}/comments`, {
      ...input,
      createdAt: new Date().toISOString(),
    });
  }

  deleteComment(id: number | string): Observable<void> {
    return this.http.delete<void>(`${API}/comments/${id}`);
  }

  updateComment(id: number | string, changes: { content: string }): Observable<Comment> {
    return this.http.patch<Comment>(`${API}/comments/${id}`, changes);
  }

  getAuthors(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  getTags(): Observable<Tag[]> {
    return this.tags$;
  }

  findOrCreateTags(names: string[]): Observable<number[]> {
    const cleaned = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    if (cleaned.length === 0) return of([]);

    const existing = this.tagsCache() ?? [];
    return forkJoin(
      cleaned.map((name) => {
        const found = existing.find(
          (t) => t.name.toLowerCase() === name.toLowerCase(),
        );
        return found
          ? of(found)
          : this.http.post<Tag>(`${API}/tags`, { name });
      }),
    ).pipe(
      tap((tags) => {
        const newTags = tags.filter((t) => !existing.some((e) => e.id === t.id));
        if (newTags.length > 0) {
          this.tagsCache.set([...existing, ...newTags]);
        }
      }),
      map((tags) => tags.map((t) => t.id)),
    );
  }
}
