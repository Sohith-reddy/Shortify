import { Injectable,signal } from '@angular/core';

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    delay?: number;
}


@Injectable({
  providedIn: 'root',
})

export class ToastService {
  toasts = signal<Toast[]>([]);

    show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', delay: number = 5000) {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, delay };
        this.toasts.update(current => [...current, toast]);

        if (delay > 0) {
            setTimeout(() => {
                this.remove(id);
            }, delay);
        }
    }

    remove(id: string) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }

    success(message: string, delay?: number) {
        this.show(message, 'success', delay);
    }

    error(message: string, delay?: number) {
        this.show(message, 'error', delay);
    }

    warning(message: string, delay?: number) {
        this.show(message, 'warning', delay);
    }

    info(message: string, delay?: number) {
        this.show(message, 'info', delay);
    }
}
