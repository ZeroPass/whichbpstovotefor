import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { BPQuestionComponent } from './bpquestion.component';

@NgModule({
  imports: [CommonModule],
  declarations: [BPQuestionComponent],
  exports: [BPQuestionComponent]
})

export class BPQuestionModule { }
