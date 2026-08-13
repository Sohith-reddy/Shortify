import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { QrService } from '../../services/qr-service/qr-service';
import { UiService } from '../../services/ui-service/ui-service';

/** Shared "show me the QR code" sheet, used from the dashboard and link detail. */
@Component({
  selector: 'app-qr-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qr-dialog.html',
  styleUrl: './qr-dialog.css',
})
export class QrDialog {
  private readonly qr = inject(QrService);
  private readonly ui = inject(UiService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Two-way so the parent can both open and be told about closing. */
  readonly visible = model(false);

  readonly url = input<string>('');
  readonly caption = input<string>('');

  private readonly renderSize = signal(260);

  readonly svg = computed<SafeHtml | null>(() => {
    const target = this.url();
    if (!target) {
      return null;
    }

    try {
      // Pure black on white scans most reliably, so the code ignores the theme.
      const markup = this.qr.toSvg(target, this.renderSize(), '#000000', '#ffffff');
      return this.sanitizer.bypassSecurityTrustHtml(markup);
    } catch {
      return null;
    }
  });

  downloadSvg(): void {
    const target = this.url();
    if (!target) {
      return;
    }

    const name = target.split('/').filter(Boolean).pop() ?? 'qr-code';
    this.ui.download(`${name}-qr.svg`, this.qr.toSvg(target, 1024, '#000000', '#ffffff'), 'image/svg+xml');
    this.ui.success('QR code saved as an SVG.', 'Downloaded');
  }

  copyLink(): void {
    void this.ui.copy(this.url(), 'Short link');
  }
}
