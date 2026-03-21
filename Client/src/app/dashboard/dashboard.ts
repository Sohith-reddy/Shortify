import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard-service/dashboard-service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface UrlData {
  id: number;
  originalUrl: string;
  shortUrl: string;
  clicked: number;
  expirationDate: Date | null;
  active: boolean;
}

interface DashboardApiUrl {
  id: number;
  originalUrl: string;
  shortUrl?: string;
  shortCode?: string;
  clickCount?: number;
  clicked?: number;
  expirationTime?: string | null;
  expirationDate?: string | null;
  isActive?: boolean;
  active?: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToggleSwitchModule,
    DialogModule,
    DatePickerModule,
    FormsModule,
    TooltipModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  urls$: Observable<UrlData[]>;

  editDialogVisible: boolean = false;
  selectedUrl: UrlData | null = null;
  tempExpirationDate: Date | null = null;

  constructor(
    private router: Router,
    private service: DashboardService,
  ) {
    this.urls$ = this.service.getUrls(1).pipe(
      map((response: any) => {
        const shortUrls = response?.data?.shortUrls ?? [];

        return shortUrls.map((item: DashboardApiUrl) => ({
          id: item.id,
          originalUrl: item.originalUrl,
          shortUrl: item.shortUrl ?? item.shortCode ?? '',
          clicked: item.clickCount ?? item.clicked ?? 0,
          expirationDate: item.expirationTime
            ? new Date(item.expirationTime)
            : item.expirationDate
              ? new Date(item.expirationDate)
              : null,
          active: item.isActive ?? item.active ?? true,
        }));
      }),
    );
  }

  showEditDialog(url: UrlData) {
    this.selectedUrl = url;
    this.tempExpirationDate = url.expirationDate;
    this.editDialogVisible = true;
  }

  saveExpiration() {
    if (this.selectedUrl) {
      this.selectedUrl.expirationDate = this.tempExpirationDate;
    }
    this.editDialogVisible = false;
  }

  toggleStatus(url: UrlData, value: boolean) {
    url.active = value;
    console.log(`URL ${url.shortUrl} active status changed to ${value}`);
  }

  redirectToCreateLink() {
    this.router.navigate(['/']);
  }

  copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }
}