import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, formatDate } from '@angular/common';
import { ShortUrlService } from '../services/short-url-service/short-url-service';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-short-url',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, DatePickerModule, CommonModule, ToastModule, DialogModule],
  templateUrl: './short-url.html',
  styleUrl: './short-url.css',
  standalone:true,
  providers:[MessageService]
})
export class ShortUrl implements OnInit {
  shortUrlForm!: FormGroup;
  shortUrl="LOCALHOST:8080/";

  showSuccessModal:boolean = false;

  constructor(private fb: FormBuilder,private service:ShortUrlService,private messageService: MessageService) {}

  ngOnInit(): void {
    this.shortUrlForm = this.fb.group({
      longUrl: [null, [Validators.required, Validators.pattern('^https?://.+')]],
      customAlias: [null, [Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      expirationDate: [null]
    });
  }

  onSubmit() {
    if (this.shortUrlForm.valid) {
      let submitObj: any = {};
      Object.keys(this.shortUrlForm.controls).forEach(key=>{
        submitObj[key] = this.shortUrlForm.get(key)?.value;
      });
      submitObj.expirationDate = this.shortUrlForm.get('expirationDate')?.value?formatDate(submitObj.expirationDate, 'yyyy-MM-dd HH:mm:ss.SSSSSS', 'en-US'): null;
      submitObj.isActive = true;
      submitObj.userId = 1;
      this.service.createUrl(submitObj).subscribe((response:any)=>{
        if(response.status){
          if(response.message === 'URL already shortened'){
            this.messageService.add({severity:'info', summary: 'Info', detail: 'This URL has already been shortened. Displaying existing short URL.'});
          }
          this.shortUrl = response.data.shortUrl;
          this.showSuccessModal = true;
        }else{
          this.messageService.add({severity:'error', summary: 'Error', detail: response.message || 'Failed to create short URL'});
        }
      },(err:any)=>{
        this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to create short URL'});
      });
    } else {
      Object.keys(this.shortUrlForm.controls).forEach(key => {
        this.shortUrlForm.get(key)?.markAsDirty();
      });
    }
  }
  copyUrl(){
    navigator.clipboard.writeText(this.shortUrl).then(()=>{
      this.messageService.add({severity:'success', summary: 'Success', detail: 'Short URL copied to clipboard'});
    }).catch(()=>{
      this.messageService.add({severity:'error', summary: 'Error', detail: 'Failed to copy short URL'});
    });
  }
  openUrl(){
    window.open(this.shortUrl, '_blank');
  }
}
