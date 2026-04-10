import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../../modules/auth/service/auth.service';

describe('authInterceptor', () => {
  const mockAuth = { token: () => null as string | null };

  beforeEach(() => {
    mockAuth.token = () => null;

    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: mockAuth }],
    });
  });

  it('should not add Authorization header when there is no token', () => {
    const request = new HttpRequest('GET', '/posts');
    let forwarded: HttpRequest<unknown> = request;

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, (req) => {
        forwarded = req;
        return of({} as HttpEvent<unknown>);
      }).subscribe();
    });

    expect(forwarded.headers.has('Authorization')).toBe(false);
  });

  it('should add Bearer token when authenticated', () => {
    mockAuth.token = () => 'my-token-123';
    const request = new HttpRequest('GET', '/posts');
    let forwarded: HttpRequest<unknown> = request;

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, (req) => {
        forwarded = req;
        return of({} as HttpEvent<unknown>);
      }).subscribe();
    });

    expect(forwarded.headers.get('Authorization')).toBe('Bearer my-token-123');
  });
});
