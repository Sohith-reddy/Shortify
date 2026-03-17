import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-short-url',
  imports: [],
  templateUrl: './short-url.html',
  styleUrl: './short-url.css',
})
export class ShortUrl {
  shortUrlForm!:FormGroup;
  constructor(private fb:FormBuilder){
    this.shortUrlForm = this.fb.group({
      originalUrl:['',Validators.compose([Validators.required,Validators.pattern('https?://.+')])],
      customAlias:['',Validators.pattern('^[a-zA-Z0-9_-]+$')],
      expirationTime:[new Date(),Validators.pattern('^\\d+(s|m|h|d)$')]
    });
  }
  ngOnInit(): void {

  }
  
}
