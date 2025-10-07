import { inject, PLATFORM_ID } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';
import { isPlatformServer } from '@angular/common';
import { of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth.service';
import { GroupsService } from '../../features/groups/services/groups.service';

/**
 * Guard that allows access to a group route only if the current user is a member
 * (either by uid or invited-by-email with null uid).
 */
export const groupMemberGuard: CanMatchFn = (route, segments: UrlSegment[]) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const groupsService = inject(GroupsService);
  const platformId = inject(PLATFORM_ID);

  // Allow on server to avoid SSR issues
  if (isPlatformServer(platformId)) {
    return of(true);
  }

  const idSegment = segments.find(s => !!s.path && !isNaN(Number(s.path)));
  const groupId = idSegment ? Number(idSegment.path) : NaN;
  if (!groupId || isNaN(groupId)) {
    return of(router.createUrlTree(['/groups']));
  }

  // Ensure pending invites get reconciled before check
  groupsService.reconcileNullUidsForCurrentUser();

  return authService.isLoggedIn().pipe(
    take(1),
    switchMap(user => {
      const uid = user?.uid || null;
      const email = user?.email || null;
      const isMember = groupsService.isUserInGroup(groupId, uid, email);
      if (isMember) {
        return of(true);
      }
      return of(router.createUrlTree(['/groups']));
    })
  );
};


