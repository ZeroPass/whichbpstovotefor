import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { QuestionComponent } from './question.component';

@NgModule({
  imports: [CommonModule],
  declarations: [QuestionComponent],
  exports: [QuestionComponent]
})

export class QuestionModule { }
