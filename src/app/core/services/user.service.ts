import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'https://api.example.com/users'; // Replace with your actual API URL
  constructor(private http: HttpClient) { }

  registerUser(userData: { fullName: string; email: string; password: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/register`, userData);
}
}
