import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { environment } from '../../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('should authenticate after a successful login', () => {
    service.login('alice', 'alice123').subscribe();

    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiUrl}/users`));
    req.flush([{ id: 1, name: 'alice', email: 'a@a.com', password: 'alice123' }]);

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()?.name).toBe('alice');
    expect(service.token()).toBeTruthy();
  });

  it('should fail login with wrong credentials', () => {
    let error = false;
    service.login('alice', 'wrong').subscribe({ error: () => (error = true) });

    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiUrl}/users`));
    req.flush([]);

    expect(error).toBe(true);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear session on logout', () => {
    service.login('alice', 'alice123').subscribe();
    const req = httpMock.expectOne((r) => r.url.startsWith(`${environment.apiUrl}/users`));
    req.flush([{ id: 1, name: 'alice', email: 'a@a.com', password: 'alice123' }]);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(environment.authStorageKey)).toBeNull();
  });
});
