import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ENDPOINTS } from '../api-url.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http:HttpClient) {}

  getUrls(userId:any) :Observable<any>{
    const url=ENDPOINTS.DASHBOARD.GET_URLS.replace(':userId', userId.toString());
    return this.http.get(`${environment.apiBaseUrl}${url}`);
  }
}
