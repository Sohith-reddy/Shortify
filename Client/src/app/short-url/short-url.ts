import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-short-url',
  imports: [ReactiveFormsModule, InputTextModule, ButtonModule, DatePickerModule, CommonModule],
  templateUrl: './short-url.html',
  styleUrl: './short-url.css',
})
export class ShortUrl implements OnInit {
  shortUrlForm!: FormGroup;
  shortUrl="short.ly/";

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.shortUrlForm = this.fb.group({
      originalUrl: ['', [Validators.required, Validators.pattern('^https?://.+')]],
      customAlias: ['', [Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      expirationDate: [null] // Use actual Date object for Calendar
    });
  }

  onSubmit() {
    if (this.shortUrlForm.valid) {
      console.log('Short URL form submitted:', this.shortUrlForm.value);
      // Implement service call later
    } else {
      Object.keys(this.shortUrlForm.controls).forEach(key => {
        this.shortUrlForm.get(key)?.markAsDirty();
      });
    }
  }
}
