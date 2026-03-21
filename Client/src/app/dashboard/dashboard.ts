import { Component, OnInit } from '@angular/core';
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
import { response } from 'express';

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

  constructor(private router: Router,private service:DashboardService){}

  ngOnInit() {
    this.getUrls();
  }

  getUrls(){
    this.service.getUrls(1).subscribe((response:any)=>{
      this.urls=response.data?.shortUrls;
    },(err:any)=>{
      console.error('Error fetching URLs:', err);
    })

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
  redirectToCreateLink(){
    this.router.navigate(['/']);
  }
}
