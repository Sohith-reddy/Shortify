import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ENDPOINTS } from '../api-url.service';

@Injectable({
  providedIn: 'root',
})
export class ShortUrlService {
  constructor(private http:HttpClient){}

  createUrl(data:any):Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}${ENDPOINTS.SHORT_URL.CREATE}`, data);
  }
}
