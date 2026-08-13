import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Thin wrapper over PrimeNG's toast bus plus the clipboard, so components
 * don't each re-implement copy-with-feedback.
 */
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Done'): void {
    this.messages.add({ severity: 'success', summary, detail, life: 2600 });
  }

  info(detail: string, summary = 'Heads up'): void {
    this.messages.add({ severity: 'info', summary, detail, life: 3200 });
  }

  warn(detail: string, summary = 'Careful'): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 3600 });
  }

  error(detail: string, summary = 'Something went wrong'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 4200 });
  }

  /** Copies text and reports the outcome as a toast. */
  async copy(text: string, label = 'Link'): Promise<boolean> {
    if (!text) {
      return false;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        this.copyViaFallback(text);
      }
      this.success(`${label} copied to clipboard.`, 'Copied');
      return true;
    } catch {
      this.error('Your browser blocked clipboard access.', 'Could not copy');
      return false;
    }
  }

  /** Triggers a client-side file download without touching the network. */
  download(filename: string, content: string, mime = 'text/plain;charset=utf-8'): void {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    // Revoke on the next tick so Safari has time to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** execCommand path for browsers/contexts without the async clipboard API. */
  private copyViaFallback(text: string): void {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
  }
}
