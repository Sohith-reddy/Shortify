import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ENDPOINTS } from '../api-url.service';
import { environment } from '../../environments/environment';
import { ApiResponse, LinkRecord, ShortUrlDto, toLinkRecord } from '../../models/short-url.model';

interface ShortUrlListPayload {
  shortUrls: ShortUrlDto[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  /** Fetches a user's links, already normalised for the UI. */
  getUrls(userId: number | null): Observable<LinkRecord[]> {
    const path =
      userId === null
        ? ENDPOINTS.DASHBOARD.GET_ALL
        : ENDPOINTS.DASHBOARD.GET_URLS.replace(':userId', String(userId));

    return this.http
      .get<ApiResponse<ShortUrlListPayload>>(`${environment.apiBaseUrl}${path}`)
      .pipe(map((response) => (response?.data?.shortUrls ?? []).map(toLinkRecord)));
  }
}
