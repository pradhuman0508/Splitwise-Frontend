import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { FirebaseService } from '../services/firebase.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let firebaseServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    firebaseServiceMock = {
      auth: {},
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseService, useValue: firebaseServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    authGuard = TestBed.inject(AuthGuard);
  });

  it('should allow access if user is authenticated', async () => {
    spyOn(firebaseServiceMock.auth, 'onAuthStateChanged').and.callFake((callback: (arg0: { uid: string; }) => void) => {
      callback({ uid: '123' }); // Mock authenticated user
    });

    const result = await authGuard.canActivate({} as any, {} as any);
    expect(result).toBeTrue();
  });

  it('should redirect to /login if user is not authenticated', async () => {
    spyOn(firebaseServiceMock.auth, 'onAuthStateChanged').and.callFake((callback: (arg0: null) => void) => {
      callback(null); // Mock unauthenticated user
    });

    const result = await authGuard.canActivate({} as any, {} as any);
    expect(result).toBeFalse();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});


