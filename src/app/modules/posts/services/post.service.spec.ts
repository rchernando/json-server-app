import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { PaginatedPosts, Post, PostService } from './post.service';
import { environment } from '../../../../environments/environment';

const API = environment.apiUrl;

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);

    // The service loads tags on init
    httpMock.expectOne(`${API}/tags`).flush([{ id: 1, name: 'Angular' }]);
  });

  it('should fetch paginated posts', () => {
    let result: PaginatedPosts | null = null;
    service.getPosts({ page: 2, pageSize: 5 }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === `${API}/posts` && r.params.get('_page') === '2' && r.params.get('_limit') === '5',
    );
    req.flush(
      [{ id: 1, userId: 1, title: 'Test', content: 'Body', createdAt: '', postTags: [] }],
      { headers: { 'X-Total-Count': '12' } },
    );

    expect(result!.total).toBe(12);
    expect(result!.items.length).toBe(1);
  });

  it('should update a post and refetch it', () => {
    let result: Post | null = null;
    service.updatePost(3, { title: 'Updated', content: 'New body', tagIds: [] }).subscribe((r) => (result = r));

    httpMock.expectOne((r) => r.method === 'PATCH' && r.url === `${API}/posts/3`).flush({});
    httpMock.expectOne(`${API}/postTags?postId=3`).flush([]);
    httpMock.expectOne(`${API}/posts/3?_expand=user&_embed=postTags`).flush({
      id: 3,
      userId: 1,
      title: 'Updated',
      content: 'New body',
      createdAt: '',
      postTags: [],
    });

    expect(result!.title).toBe('Updated');
  });

  it('should delete a comment', () => {
    let done = false;
    service.deleteComment(7).subscribe(() => (done = true));

    httpMock.expectOne((r) => r.method === 'DELETE' && r.url === `${API}/comments/7`).flush(null);

    expect(done).toBe(true);
  });
});
