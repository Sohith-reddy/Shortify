import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule, formatDate } from '@angular/common';
import { ShortUrlService } from '../services/short-url-service/short-url-service';

@Component({
  selector: 'app-short-url',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, DatePickerModule, CommonModule],
  templateUrl: './short-url.html',
  styleUrl: './short-url.css',
})
export class ShortUrl implements OnInit {
  shortUrlForm!: FormGroup;
  shortUrl="LOCALHOST:8080/";

  constructor(private fb: FormBuilder,private service:ShortUrlService) {}

  ngOnInit(): void {
    this.shortUrlForm = this.fb.group({
      originalUrl: ['', [Validators.required, Validators.pattern('^https?://.+')]],
      customAlias: ['', [Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      expirationDate: [null]
    });
  }

  onSubmit() {
    if (this.shortUrlForm.valid) {
      let submitObj: any = {};
      Object.keys(this.shortUrlForm.controls).forEach(key=>{
        submitObj[key] = this.shortUrlForm.get(key)?.value;
      });
      submitObj.expirationDate = formatDate(submitObj.expirationDate, 'yyyy-MM-dd HH:mm:ss.SSSSSS', 'en-US');
      this.service.createUrl(submitObj).subscribe((response:any)=>{
        
      },(err:any)=>{
        
      });
    } else {
      Object.keys(this.shortUrlForm.controls).forEach(key => {
        this.shortUrlForm.get(key)?.markAsDirty();
      });
    }
  }
}
