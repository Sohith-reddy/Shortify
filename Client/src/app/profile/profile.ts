import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RouterLink } from '@angular/router';
import { ThemeService, ThemeMode } from '../services/theme-service/theme-service';
import { UiService } from '../services/ui-service/ui-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, AvatarModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ui = inject(UiService);
  readonly theme = inject(ThemeService);

  profileForm!: FormGroup;
  readonly isEditing = signal(false);

  readonly initials = computed(() => {
    const first = this.profileForm?.get('firstName')?.value ?? '';
    const last = this.profileForm?.get('lastName')?.value ?? '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
  });

  readonly themeOptions: { label: string; value: ThemeMode; icon: string }[] = [
    { label: 'Light', value: 'light', icon: 'pi pi-sun' },
    { label: 'Dark', value: 'dark', icon: 'pi pi-moon' },
    { label: 'Auto', value: 'system', icon: 'pi pi-desktop' },
  ];

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      firstName: [{ value: 'Amy', disabled: true }, Validators.required],
      lastName: [{ value: 'Elsner', disabled: true }, Validators.required],
      email: [{ value: 'amy.elsner@example.com', disabled: true }, [Validators.required, Validators.email]],
      company: [{ value: 'PrimeFaces', disabled: true }],
    });
  }

  toggleEdit(): void {
    this.isEditing.update((editing) => !editing);

    if (this.isEditing()) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isEditing.set(false);
      this.profileForm.disable();
      this.ui.success('Your profile has been updated.', 'Saved');
    } else {
      this.profileForm.markAllAsTouched();
    }
  }

  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
  }
}
