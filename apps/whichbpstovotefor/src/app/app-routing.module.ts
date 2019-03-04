import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component'
import { QuestionComponent } from './question/question.component'
import { ResultComponent } from './result/result.component'
import { BPHomeComponent } from './bphome/bphome.component'
import { BPQuestionComponent } from './bpquestion/bpquestion.component'
import { AuthGuard } from './guard/auth.guard'

const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'question/:id', component: QuestionComponent},
    {path: 'results', component: ResultComponent},
    {path: 'bp', component: BPHomeComponent},

    {path: 'questions', component: BPQuestionComponent, canActivate: [AuthGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {}
