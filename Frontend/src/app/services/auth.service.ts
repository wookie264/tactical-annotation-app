import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  isAdmin: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check if user is already logged in
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          // Store token
          localStorage.setItem('token', response.access_token);
          // Store user info
          this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, request);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        username: payload.username,
        fullname: payload.fullname,
        email: payload.email,
        phone: payload.phone,
        isAdmin: payload.isAdmin
      };
    } catch {
      return {
        id: '',
        username: '',
        fullname: '',
        email: '',
        isAdmin: false
      };
    }
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
    } else {
      localStorage.removeItem('token');
    }
  }
} 