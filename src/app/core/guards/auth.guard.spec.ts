import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Route, Router, UrlSegment } from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../../modules/auth/service/auth.service';

describe('authGuard', () => {
  const mockRouter = { parseUrl: vi.fn().mockReturnValue('/login') };
  const mockAuth = { isAuthenticated: () => false };

  beforeEach(() => {
    mockRouter.parseUrl.mockClear();
    mockAuth.isAuthenticated = () => false;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
  });

  it('should allow access when authenticated', () => {
    mockAuth.isAuthenticated = () => true;
    const result = TestBed.runInInjectionContext(() => authGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should redirect to /login when not authenticated', () => {
    TestBed.runInInjectionContext(() => authGuard({} as Route, [] as UrlSegment[]));
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/login');
  });
});

describe('guestGuard', () => {
  const mockRouter = { parseUrl: vi.fn().mockReturnValue('/') };
  const mockAuth = { isAuthenticated: () => false };

  beforeEach(() => {
    mockRouter.parseUrl.mockClear();
    mockAuth.isAuthenticated = () => false;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuth },
      ],
    });
  });

  it('should allow access to /login when not authenticated', () => {
    const result = TestBed.runInInjectionContext(() => guestGuard({} as Route, [] as UrlSegment[]));
    expect(result).toBe(true);
  });

  it('should redirect to / when already authenticated', () => {
    mockAuth.isAuthenticated = () => true;
    TestBed.runInInjectionContext(() => guestGuard({} as Route, [] as UrlSegment[]));
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
  });
});
