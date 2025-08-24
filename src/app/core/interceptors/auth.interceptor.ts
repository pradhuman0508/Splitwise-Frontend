import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip Firebase operations during SSR
    if (!isPlatformBrowser(this.platformId)) {
      return next.handle(req);
    }

    return from(this.auth.currentUser?.getIdToken() ?? Promise.resolve(null)).pipe(
      switchMap(token => {
        if (token) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }
}
