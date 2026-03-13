import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShortUrlRoutingModule } from './short-url-routing.module';
import { ShortUrlComponent } from './components/short-url/short-url.component';


@NgModule({
  declarations: [
    ShortUrlComponent
  ],
  imports: [
    CommonModule,
    ShortUrlRoutingModule
  ]
})
export class ShortUrlModule { }
