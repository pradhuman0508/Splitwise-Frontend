import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule, Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from './layout.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { Subject, filter, takeUntil } from 'rxjs';


@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule,RouterLink],
    templateUrl: "app.topbar.html"
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    activeTab: string = '';
    private destroy$ = new Subject<void>();

    constructor(
        public layoutService: LayoutService,
        public authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Subscribe to router events to reset activeTab when URL changes
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe((event: NavigationEnd) => {
                // Reset activeTab when navigating to a different route
                this.updateActiveTabFromRoute(event.url);
            });

        // Set initial active tab based on current route
        this.updateActiveTabFromRoute(this.router.url);
    }

    ngOnDestroy(): void {
        // Complete the destroy subject to unsubscribe from all observables
        this.destroy$.next();
        this.destroy$.complete();
    }

    private updateActiveTabFromRoute(url: string): void {
        // Reset activeTab based on current route
        if (url.includes('/dashboard')) {
            this.activeTab = 'dashboard';
        } else if (url.includes('/groups')) {
            this.activeTab = 'groups';
        } else if (url.includes('/friends')) {
            this.activeTab = 'friends';
        } else {
            this.activeTab = '';
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    // Tab navigation methods
    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    isActiveTab(tab: string): boolean {
        return this.activeTab === tab;
    }

}
