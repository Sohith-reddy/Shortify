import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from '../api-url.service';
import { ApiResponse, CreateLinkRequest, ShortUrlDto } from '../../models/short-url.model';

@Injectable({
  providedIn: 'root',
})
export class ShortUrlService {
  private readonly http = inject(HttpClient);

  /** Emits whenever a link is created, so open dashboards can refresh. */
  private readonly created = new Subject<void>();
  readonly created$ = this.created.asObservable();

  createUrl(data: CreateLinkRequest): Observable<ApiResponse<ShortUrlDto>> {
    return this.http.post<ApiResponse<ShortUrlDto>>(
      `${environment.apiBaseUrl}${ENDPOINTS.SHORT_URL.CREATE}`,
      data,
    );
  }

  getAnalytics(shortCode: string): Observable<ApiResponse<ShortUrlDto>> {
    const path = ENDPOINTS.SHORT_URL.ANALYTICS.replace(':shortCode', encodeURIComponent(shortCode));
    return this.http.get<ApiResponse<ShortUrlDto>>(`${environment.apiBaseUrl}${path}`);
  }

  notifyCreated(): void {
    this.created.next();
  }
}
