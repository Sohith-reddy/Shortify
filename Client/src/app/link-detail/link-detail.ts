import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ShortUrlService } from '../services/short-url-service/short-url-service';
import { UiService } from '../services/ui-service/ui-service';
import { QrDialog } from '../shared/qr-dialog/qr-dialog';
import { LinkRecord, ShortUrlDto, toLinkRecord } from '../models/short-url.model';

@Component({
  selector: 'app-link-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, QrDialog],
  templateUrl: './link-detail.html',
  styleUrl: './link-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(ShortUrlService);
  private readonly ui = inject(UiService);

  readonly link = signal<LinkRecord | null>(null);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly qrVisible = signal(false);

  readonly shortCode = signal('');

  /** Days the link has been live, used for the "per day" figure. */
  readonly ageInDays = computed(() => {
    const created = this.link()?.createdAt;
    if (!created) {
      return null;
    }
    const days = (Date.now() - created.getTime()) / 86_400_000;
    return Math.max(days, 1);
  });

  readonly clicksPerDay = computed(() => {
    const link = this.link();
    const age = this.ageInDays();
    if (!link || age === null) {
      return null;
    }
    return Math.round((link.clicks / age) * 10) / 10;
  });

  /** Countdown text for links that carry an expiry. */
  readonly expiresIn = computed(() => {
    const expiry = this.link()?.expirationDate;
    if (!expiry) {
      return null;
    }

    const ms = expiry.getTime() - Date.now();
    if (ms <= 0) {
      return 'Expired';
    }

    const days = Math.floor(ms / 86_400_000);
    if (days >= 1) {
      return `in ${days} day${days === 1 ? '' : 's'}`;
    }

    const hours = Math.max(Math.floor(ms / 3_600_000), 1);
    return `in ${hours} hour${hours === 1 ? '' : 's'}`;
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('shortCode') ?? '';
    this.shortCode.set(code);

    if (!code) {
      this.loading.set(false);
      this.failed.set(true);
      return;
    }

    this.service.getAnalytics(code).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response?.status || !response.data) {
          this.failed.set(true);
          return;
        }

        // The analytics endpoint omits id/shortCode, so fill them in.
        const dto: ShortUrlDto = {
          ...response.data,
          id: response.data.id ?? 0,
          shortCode: response.data.shortCode ?? code,
        };

        this.link.set(toLinkRecord(dto));
      },
      error: () => {
        this.loading.set(false);
        this.failed.set(true);
      },
    });
  }

  copyShort(): void {
    const link = this.link();
    if (link) {
      void this.ui.copy(link.shortUrl, 'Short link');
    }
  }

  showQr(): void {
    this.qrVisible.set(true);
  }
}
