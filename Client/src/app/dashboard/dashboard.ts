import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

interface UrlData {
  id: string;
  originalUrl: string;
  shortUrl: string;
  clicked: number;
  expirationDate: Date | null;
  active: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, TableModule, ButtonModule, ToggleSwitchModule, DialogModule, DatePickerModule, FormsModule, TooltipModule],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  urls: UrlData[] = [];
  editDialogVisible: boolean = false;
  selectedUrl: UrlData | null = null;
  tempExpirationDate: Date | null = null;

  ngOnInit() {
    this.urls = [
      { id: '1', originalUrl: 'https://github.com/Sohith-reddy', shortUrl: 'short.ly/sohith-github', clicked: 124, expirationDate: new Date(2026, 11, 31), active: true },
      { id: '2', originalUrl: 'https://angular.dev/guide/components', shortUrl: 'short.ly/ng-docs', clicked: 52, expirationDate: null, active: true },
      { id: '3', originalUrl: 'https://primeng.org/table', shortUrl: 'short.ly/prime-table', clicked: 8, expirationDate: new Date(2024, 5, 20), active: false },
    ];
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

  toggleStatus(url: UrlData) {
    console.log(`URL ${url.shortUrl} active status changed to ${url.active}`);
  }
}
