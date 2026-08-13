import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith, switchMap } from 'rxjs/operators';
import { Subject, merge } from 'rxjs';
import { DashboardService } from '../services/dashboard-service/dashboard-service';
import { ShortUrlService } from '../services/short-url-service/short-url-service';
import { UiService } from '../services/ui-service/ui-service';
import { QrDialog } from '../shared/qr-dialog/qr-dialog';
import { LinkRecord, LinkStatus } from '../models/short-url.model';
import { environment } from '../environments/environment';

type SortKey = 'recent' | 'clicks' | 'expiring' | 'alpha';
type StatusFilter = 'all' | LinkStatus;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    TooltipModule,
    InputTextModule,
    SelectModule,
    RouterLink,
    QrDialog,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly service = inject(DashboardService);
  private readonly shortUrlService = inject(ShortUrlService);
  private readonly ui = inject(UiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly reload = new Subject<void>();

  readonly links = signal<LinkRecord[]>([]);
  readonly loading = signal(true);
  readonly loadFailed = signal(false);

  readonly query = signal('');
  readonly status = signal<StatusFilter>('all');
  readonly sort = signal<SortKey>('recent');

  readonly qrVisible = signal(false);
  readonly qrTarget = signal<LinkRecord | null>(null);

  readonly statusOptions = [
    { label: 'All links', value: 'all' as const },
    { label: 'Active', value: 'active' as const },
    { label: 'Paused', value: 'paused' as const },
    { label: 'Expired', value: 'expired' as const },
  ];

  readonly sortOptions = [
    { label: 'Newest first', value: 'recent' as const },
    { label: 'Most clicked', value: 'clicks' as const },
    { label: 'Expiring soon', value: 'expiring' as const },
    { label: 'Destination A–Z', value: 'alpha' as const },
  ];

  /** Headline numbers across every link the user owns. */
  readonly stats = computed(() => {
    const all = this.links();
    const totalClicks = all.reduce((sum, link) => sum + link.clicks, 0);
    const active = all.filter((link) => link.status === 'active').length;
    const best = all.reduce<LinkRecord | null>(
      (top, link) => (top === null || link.clicks > top.clicks ? link : top),
      null,
    );

    return {
      total: all.length,
      totalClicks,
      active,
      avgClicks: all.length ? Math.round((totalClicks / all.length) * 10) / 10 : 0,
      best,
    };
  });

  /** Search + status filter + sort, applied in that order. */
  readonly visibleLinks = computed(() => {
    const needle = this.query().trim().toLowerCase();
    const status = this.status();
    const sort = this.sort();

    let rows = this.links();

    if (status !== 'all') {
      rows = rows.filter((link) => link.status === status);
    }

    if (needle) {
      rows = rows.filter(
        (link) =>
          link.originalUrl.toLowerCase().includes(needle) ||
          link.shortUrl.toLowerCase().includes(needle) ||
          link.shortCode.toLowerCase().includes(needle),
      );
    }

    // Copy before sorting so the source signal is never mutated in place.
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'clicks':
          return b.clicks - a.clicks;
        case 'expiring': {
          // Links without an expiry sort last.
          const aTime = a.expirationDate?.getTime() ?? Number.POSITIVE_INFINITY;
          const bTime = b.expirationDate?.getTime() ?? Number.POSITIVE_INFINITY;
          return aTime - bTime;
        }
        case 'alpha':
          return a.domain.localeCompare(b.domain);
        default:
          return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      }
    });
  });

  readonly hasFilters = computed(() => this.query().trim() !== '' || this.status() !== 'all');

  ngOnInit(): void {
    // Refetch on first paint, on manual refresh, and whenever a link is created.
    merge(this.reload, this.shortUrlService.created$)
      .pipe(
        startWith(void 0),
        switchMap(() => {
          this.loading.set(true);
          this.loadFailed.set(false);
          return this.service.getUrls(environment.demoUserId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rows) => {
          this.links.set(rows);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadFailed.set(true);
          this.ui.error('Could not load your links. Is the backend running?');
        },
      });
  }

  refresh(): void {
    this.reload.next();
  }

  clearFilters(): void {
    this.query.set('');
    this.status.set('all');
  }

  onQueryInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  copy(link: LinkRecord): void {
    void this.ui.copy(link.shortUrl, 'Short link');
  }

  openQr(link: LinkRecord): void {
    this.qrTarget.set(link);
    this.qrVisible.set(true);
  }

  viewDetail(link: LinkRecord): void {
    this.router.navigate(['/link', link.shortCode]);
  }

  createLink(): void {
    this.router.navigate(['/']);
  }

  exportCsv(): void {
    const rows = this.visibleLinks();

    if (!rows.length) {
      this.ui.warn('There is nothing to export with the current filters.');
      return;
    }

    const header = ['Short URL', 'Short code', 'Destination', 'Clicks', 'Status', 'Created', 'Expires'];

    const body = rows.map((link) => [
      link.shortUrl,
      link.shortCode,
      link.originalUrl,
      String(link.clicks),
      link.status,
      link.createdAt ? link.createdAt.toISOString() : '',
      link.expirationDate ? link.expirationDate.toISOString() : 'never',
    ]);

    const csv = [header, ...body].map((cells) => cells.map(escapeCsv).join(',')).join('\r\n');
    const stamp = new Date().toISOString().slice(0, 10);

    this.ui.download(`shortify-links-${stamp}.csv`, csv, 'text/csv;charset=utf-8');
    this.ui.success(`Exported ${rows.length} link${rows.length === 1 ? '' : 's'}.`, 'Downloaded');
  }

  statusLabel(status: LinkStatus): string {
    return status === 'active' ? 'Active' : status === 'paused' ? 'Paused' : 'Expired';
  }

  faviconFor(domain: string): string {
    return `https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(domain)}`;
  }

  trackById(_index: number, link: LinkRecord): number {
    return link.id;
  }
}

function escapeCsv(value: string): string {
  const needsQuotes = /[",\r\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
