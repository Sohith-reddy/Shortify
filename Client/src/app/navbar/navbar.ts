import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, AvatarModule, MenuModule, ButtonModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Features', href: '/' },
  ];

  profileItems: MenuItem[] | undefined;

  ngOnInit() {
      this.profileItems = [
          {
              label: 'Profile',
              icon: 'pi pi-user',
              routerLink: '/profile'
          },
          {
              label: 'Logout',
              icon: 'pi pi-sign-out'
          }
      ];
  }
}
