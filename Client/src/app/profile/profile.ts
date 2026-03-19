import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, AvatarModule],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  profileForm!: FormGroup;
  isEditing: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.profileForm = this.fb.group({
      firstName: [{ value: 'Amy', disabled: true }, Validators.required],
      lastName: [{ value: 'Elsner', disabled: true }, Validators.required],
      email: [{ value: 'amy.elsner@example.com', disabled: true }, [Validators.required, Validators.email]],
      company: [{ value: 'PrimeFaces', disabled: true }]
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      // Typically, here we'd check if the form is valid, then save context to backend.
      // E.g., if (!this.profileForm.valid) { return; }
      this.profileForm.disable();
    }
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('Profile saved:', this.profileForm.value);
      this.isEditing = false;
      this.profileForm.disable();
    }
  }
}
