import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ThemeService } from '../services/theme-service/theme-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AvatarModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = inject(ThemeService);

  readonly navLinks = [
    { label: 'Create', href: '/', icon: 'pi pi-plus-circle' },
    { label: 'Links', href: '/dashboard', icon: 'pi pi-list' },
    { label: 'Bulk', href: '/bulk', icon: 'pi pi-bolt' },
  ];

  profileItems: MenuItem[] = [];

  readonly isScrolled = signal(false);
  readonly mobileOpen = signal(false);

  ngOnInit(): void {
    this.profileItems = [
      { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
      { label: 'My links', icon: 'pi pi-list', routerLink: '/dashboard' },
      { separator: true },
      {
        label: 'Sign out',
        icon: 'pi pi-sign-out',
      },
    ];

    this.watchScroll();
    this.closeMenuOnNavigate();
  }

  toggleMobile(): void {
    this.mobileOpen.update((open) => !open);
  }

  /** The floating bar gains its blur only once content slides beneath it. */
  private watchScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    fromEvent(window, 'scroll', { passive: true })
      .pipe(
        map(() => window.scrollY > 8),
        startWith(window.scrollY > 8),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((scrolled) => this.isScrolled.set(scrolled));
  }

  private closeMenuOnNavigate(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.mobileOpen.set(false));
  }
}
