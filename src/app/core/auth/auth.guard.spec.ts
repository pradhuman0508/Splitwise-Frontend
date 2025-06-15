import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { of } from 'rxjs';
import { User } from 'firebase/auth';
import { user } from '@angular/fire/auth';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    const rSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: rSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  const mockUser = {
    uid: '123',
    email: 'test@example.com',
    displayName: 'Test User'
    // add other User properties as needed
  } as User;

  it('should return true if user is logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(of(mockUser));
    expect(guard.canActivate()).toBeTrue();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should return false and navigate if user is not logged in', () => {
    authServiceSpy.isLoggedIn.and.returnValue(of(null));
    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
