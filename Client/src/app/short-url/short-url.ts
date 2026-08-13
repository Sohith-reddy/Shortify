import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ShortUrlService } from '../services/short-url-service/short-url-service';
import { UiService } from '../services/ui-service/ui-service';
import { QrDialog } from '../shared/qr-dialog/qr-dialog';
import { CreateLinkRequest, hostnameOf } from '../models/short-url.model';
import { environment } from '../environments/environment';

function aliasValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  if (!value) {
    return null;
  }
  return /^[a-zA-Z0-9_-]{4,15}$/.test(value) ? null : { alias: true };
}

/** Expiry must be in the future to be meaningful. */
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  return new Date(control.value).getTime() > Date.now() ? null : { past: true };
}

interface CreatedLink {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  reused: boolean;
}

@Component({
  selector: 'app-short-url',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DatePickerModule,
    CommonModule,
    RouterLink,
    QrDialog,
  ],
  templateUrl: './short-url.html',
  styleUrl: './short-url.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShortUrl implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ShortUrlService);
  private readonly ui = inject(UiService);

  shortUrlForm!: FormGroup;

  readonly submitting = signal(false);
  readonly result = signal<CreatedLink | null>(null);
  readonly showAdvanced = signal(false);
  readonly qrVisible = signal(false);

  readonly aliasPrefix = `${environment.apiBaseUrl.replace(/^https?:\/\//, '')}/r/`;

  readonly minDate = new Date();

  readonly highlights = [
    {
      icon: 'pi pi-bolt',
      title: 'Redis-backed redirects',
      copy: 'Resolved links are cached, so repeat visits skip the database entirely.',
    },
    {
      icon: 'pi pi-qrcode',
      title: 'Instant QR codes',
      copy: 'Every link gets a scannable code you can download as a crisp SVG.',
    },
    {
      icon: 'pi pi-clock',
      title: 'Links that expire',
      copy: 'Give a link a shelf life and it stops resolving once the date passes.',
    },
    {
      icon: 'pi pi-chart-bar',
      title: 'Click analytics',
      copy: 'Track how often each link is opened, from one shared dashboard.',
    },
  ];

  ngOnInit(): void {
    this.shortUrlForm = this.fb.group({
      longUrl: [null, [Validators.required, Validators.pattern('^https?://.+\\..+')]],
      customAlias: [null, [aliasValidator]],
      expirationDate: [null, [futureDateValidator]],
    });
  }

  get longUrlControl(): AbstractControl {
    return this.shortUrlForm.controls['longUrl'];
  }

  get aliasControl(): AbstractControl {
    return this.shortUrlForm.controls['customAlias'];
  }

  get expiryControl(): AbstractControl {
    return this.shortUrlForm.controls['expirationDate'];
  }

  toggleAdvanced(): void {
    this.showAdvanced.update((open) => !open);
  }

  onSubmit(): void {
    if (this.submitting()) {
      return;
    }

    if (this.shortUrlForm.invalid) {
      this.shortUrlForm.markAllAsTouched();
      this.ui.warn('Check the highlighted fields and try again.', 'Almost there');
      return;
    }

    const raw = this.shortUrlForm.getRawValue();
    const alias = (raw.customAlias ?? '').trim();

    const payload: CreateLinkRequest = {
      longUrl: (raw.longUrl ?? '').trim(),
      customAlias: alias || null,
      expirationTime: raw.expirationDate ? toLocalDateTimeString(raw.expirationDate) : null,
      isActive: true,
      userId: environment.demoUserId,
    };

    this.submitting.set(true);

    this.service.createUrl(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);

        if (!response?.status || !response.data) {
          this.ui.error(response?.message || 'The link could not be created.');
          return;
        }

        const reused = response.message === 'URL already shortened';

        this.result.set({
          shortUrl: response.data.shortUrl,
          shortCode: response.data.shortCode,
          originalUrl: response.data.originalUrl,
          reused,
        });

        this.service.notifyCreated();

        if (reused) {
          this.ui.info('You had already shortened this URL, so here it is again.', 'Existing link');
        } else {
          this.ui.success('Your short link is ready.', 'Created');
        }
      },
      error: () => {
        this.submitting.set(false);
        this.ui.error('Could not reach the server. Is the backend running?');
      },
    });
  }

  copyResult(): void {
    const created = this.result();
    if (created) {
      void this.ui.copy(created.shortUrl, 'Short link');
    }
  }

  openResult(): void {
    const created = this.result();
    if (created) {
      window.open(created.shortUrl, '_blank', 'noopener');
    }
  }

  showQr(): void {
    this.qrVisible.set(true);
  }

  reset(): void {
    this.shortUrlForm.reset();
    this.result.set(null);
    this.showAdvanced.set(false);
  }

  destinationHost(url: string): string {
    return hostnameOf(url);
  }
}

function toLocalDateTimeString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}
