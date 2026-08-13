import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'shortify.theme';

/**
 * Owns the light/dark appearance for the whole app.
 *
 * Mirrors macOS: an explicit Light/Dark choice wins, otherwise we follow the
 * OS preference and keep following it as it changes.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly systemPrefersDark = signal(false);

  readonly mode = signal<ThemeMode>('system');

  readonly isDark = computed(() => {
    const mode = this.mode();
    return mode === 'system' ? this.systemPrefersDark() : mode === 'dark';
  });

  readonly icon = computed(() => (this.isDark() ? 'pi pi-sun' : 'pi pi-moon'));

  readonly label = computed(() =>
    this.isDark() ? 'Switch to light appearance' : 'Switch to dark appearance',
  );

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemPrefersDark.set(query.matches);
    query.addEventListener('change', (event) => {
      this.systemPrefersDark.set(event.matches);
      if (this.mode() === 'system') {
        this.paint();
      }
    });

    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      this.mode.set(saved);
    }

    this.paint();
  }

  /** Cycles the explicit choice; used by the navbar's single-tap control. */
  toggle(): void {
    this.set(this.isDark() ? 'light' : 'dark');
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);

    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, mode);
    this.paint();
  }

  private paint(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const dark = this.isDark();
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
}
