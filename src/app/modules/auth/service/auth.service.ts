import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _httpClient = inject(HttpClient);
  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _session = signal<AuthSession | null>(this.restore());

  public readonly session = this._session.asReadonly();
  public readonly currentUser = computed(() => this._session()?.user ?? null);
  public readonly token = computed(() => this._session()?.token ?? null);
  public readonly isAuthenticated = computed(
    () => (this._isBrowser && this._session() !== null) || !this._isBrowser,
  );

  public login(name: string, password: string): Observable<AuthSession> {
    const params = new URLSearchParams({ name, password }).toString();
    return this._httpClient
      .get<
        { id: number; name: string; email: string; password: string }[]
      >(`${environment.apiUrl}/users?${params}`)
      .pipe(
        map((users) => {
          const { id, name: userName, email } = users[0];
          const session: AuthSession = {
            user: { id, name: userName, email },
            token: `mock-token-${id}-${Date.now()}`,
          };
          return session;
        }),
        tap((session) => this.persist(session)),
      );
  }

  public logout(): void {
    this._session.set(null);
    localStorage.removeItem(environment.authStorageKey);
  }

  private persist(session: AuthSession): void {
    this._session.set(session);
    if (this._isBrowser) {
      localStorage.setItem(environment.authStorageKey, JSON.stringify(session));
    }
  }

  private restore(): AuthSession | null {
    if (!this._isBrowser) return null;
    try {
      const raw = localStorage.getItem(environment.authStorageKey);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
