import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { fromEvent } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AvatarModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Features', href: '/' },
  ];

  profileItems: MenuItem[] | undefined;
  readonly isDarkMode = signal(false);
  readonly isScrolled = signal(false);
  readonly themeIcon = computed(() =>
    this.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'
  );
  readonly themeLabel = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'
  );

  ngOnInit() {
    this.profileItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/profile',
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
      },
    ];

    this.initializeTheme();
    this.watchScrollState();
  }

  toggleTheme() {
    const nextMode = !this.isDarkMode();
    this.applyTheme(nextMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    }
  }

  private initializeTheme() {
    if (typeof window === 'undefined') {
      return;
    }

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyTheme(saved ? saved === 'dark' : prefersDark);
  }

  private applyTheme(isDark: boolean) {
    this.isDarkMode.set(isDark);

    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }

  private watchScrollState() {
    if (typeof window === 'undefined') {
      return;
    }

    fromEvent(window, 'scroll')
      .pipe(
        map(() => window.scrollY > 16),
        startWith(window.scrollY > 16),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((isScrolled) => this.isScrolled.set(isScrolled));
  }
}
