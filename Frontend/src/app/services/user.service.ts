import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  username: string;
  fullname: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
}

export interface CreateUserRequest {
  username: string;
  fullname: string;
  email: string;
  password: string;
  phone?: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createUser(user: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user, { headers: this.getHeaders() });
  }

  updateUser(id: string, user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile/me`, { headers: this.getHeaders() });
  }

  updateProfile(user: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/profile/me`, user, { headers: this.getHeaders() });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/profile/change-password`, 
      { oldPassword, newPassword }, 
      { headers: this.getHeaders() }
    );
  }
} 