import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';  
import { BPHomeComponent } from './bphome.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BPHomeComponent],
  exports: [BPHomeComponent]
})

export class BPHomeModule { }
