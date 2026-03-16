import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {

  updateOrderStatusUrl(updateOrderStatusUrl: any, formData: FormData) {
    throw new Error('Method not implemented.');
  }

  constructor() {}

  public baseUrl = `http://localhost:8080/api/`; //----UAT
  public baseUrlWithoutAPI = `http://localhost:8080/`; //----UAT
  // public baseUrl = 'https://dartglobal.apptmyz.com/wms/api/'; //----PROD
  // public baseUrlWithoutAPI = `https://dartglobal.apptmyz.com/wms/`; //----PROD

}
