import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { concatMap, from, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ShortUrlService } from '../services/short-url-service/short-url-service';
import { UiService } from '../services/ui-service/ui-service';
import { environment } from '../environments/environment';
import { ApiResponse, ShortUrlDto } from '../models/short-url.model';

type RowState = 'pending' | 'working' | 'done' | 'failed';

interface BulkRow {
  input: string;
  state: RowState;
  shortUrl: string | null;
  message: string | null;
}

/** Cap the batch so an accidental paste can't hammer the API. */
const MAX_URLS = 25;

@Component({
  selector: 'app-bulk',
  standalone: true,
  imports: [CommonModule, FormsModule, TextareaModule, ButtonModule, RouterLink],
  templateUrl: './bulk.html',
  styleUrl: './bulk.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Bulk {
  private readonly service = inject(ShortUrlService);
  private readonly ui = inject(UiService);

  readonly raw = signal('');
  readonly rows = signal<BulkRow[]>([]);
  readonly running = signal(false);

  readonly maxUrls = MAX_URLS;

  /** Distinct, non-empty lines from the textarea. */
  readonly parsed = computed(() => {
    const seen = new Set<string>();
    const out: string[] = [];

    for (const line of this.raw().split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        out.push(trimmed);
      }
    }

    return out;
  });

  readonly validCount = computed(() => this.parsed().filter((url) => isHttpUrl(url)).length);
  readonly invalidCount = computed(() => this.parsed().length - this.validCount());
  readonly overLimit = computed(() => this.validCount() > MAX_URLS);

  readonly succeeded = computed(() => this.rows().filter((r) => r.state === 'done'));

  readonly canRun = computed(
    () => !this.running() && this.validCount() > 0 && !this.overLimit(),
  );

  onInput(event: Event): void {
    this.raw.set((event.target as HTMLTextAreaElement).value);
  }

  run(): void {
    if (!this.canRun()) {
      return;
    }

    const urls = this.parsed().filter(isHttpUrl);

    this.rows.set(
      urls.map((input) => ({ input, state: 'pending', shortUrl: null, message: null })),
    );
    this.running.set(true);

    // concatMap keeps requests strictly sequential, so the backend sees a
    // steady trickle rather than 25 simultaneous inserts.
    from(urls)
      .pipe(
        concatMap((url, index) => {
          this.patch(index, { state: 'working' });

          return this.service
            .createUrl({
              longUrl: url,
              customAlias: null,
              expirationTime: null,
              isActive: true,
              userId: environment.demoUserId,
            })
            .pipe(
              catchError(() =>
                of({
                  status: false,
                  message: 'Request failed',
                  statusCode: 0,
                  data: null,
                } as unknown as ApiResponse<ShortUrlDto>),
              ),
              concatMap((response) => of({ response, index })),
            );
        }),
        finalize(() => {
          this.running.set(false);
          this.service.notifyCreated();

          const ok = this.rows().filter((r) => r.state === 'done').length;
          const failed = this.rows().length - ok;

          if (ok && !failed) {
            this.ui.success(`Shortened ${ok} link${ok === 1 ? '' : 's'}.`, 'All done');
          } else if (ok) {
            this.ui.warn(`${ok} shortened, ${failed} failed.`, 'Partly done');
          } else if (this.rows().length) {
            this.ui.error('None of the links could be shortened.');
          }
        }),
      )
      .subscribe(({ response, index }) => {
        if (response?.status && response.data) {
          this.patch(index, {
            state: 'done',
            shortUrl: response.data.shortUrl,
            message: response.message === 'URL already shortened' ? 'Already existed' : null,
          });
        } else {
          this.patch(index, {
            state: 'failed',
            message: response?.message || 'Could not shorten',
          });
        }
      });
  }

  copyAll(): void {
    const links = this.succeeded()
      .map((row) => row.shortUrl)
      .filter((url): url is string => url !== null);

    if (!links.length) {
      this.ui.warn('There are no finished links to copy yet.');
      return;
    }

    void this.ui.copy(links.join('\n'), `${links.length} links`);
  }

  exportCsv(): void {
    const done = this.succeeded();

    if (!done.length) {
      this.ui.warn('There are no finished links to export yet.');
      return;
    }

    const csv = [
      ['Destination', 'Short URL'],
      ...done.map((row) => [row.input, row.shortUrl ?? '']),
    ]
      .map((cells) => cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    this.ui.download(
      `shortify-bulk-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      'text/csv;charset=utf-8',
    );
  }

  copyRow(row: BulkRow): void {
    if (row.shortUrl) {
      void this.ui.copy(row.shortUrl, 'Short link');
    }
  }

  reset(): void {
    this.raw.set('');
    this.rows.set([]);
  }

  private patch(index: number, patch: Partial<BulkRow>): void {
    this.rows.update((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
