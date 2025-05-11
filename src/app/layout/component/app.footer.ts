import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="container mx-auto px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
        © 2024 Your Application. All rights reserved.
      </div>`
})
export class AppFooter {}
