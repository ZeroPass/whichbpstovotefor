import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NxModule } from '@nrwl/nx';
import { HttpClientModule } from '@angular/common/http';

import { DataService } from './shared/data.service';
import { DataServiceImpl } from './shared/api.data.service';
// import { StubDataServiceImpl } from './shared/stub.data.service';
import { ResponseDataService } from './shared/response.data.service';
import { ScatterService } from './shared/scatter.service'
import { AuthGuard } from './guard/auth.guard'

import { HomeModule } from './home/home.module';
import { QuestionModule } from './question/question.module';
import { ResultModule } from './result/result.module';
import { SharedModule } from './shared/shared.module';

import { BPHomeModule } from './bphome/bphome.module';
import { BPQuestionModule } from './bpquestion/bpquestion.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    BPHomeModule,
    QuestionModule,
    BPQuestionModule,
    ResultModule,
    SharedModule,
    HttpClientModule,
    NxModule.forRoot()
  ],
  providers: [ {provide: DataService, useClass: DataServiceImpl}, ResponseDataService, ScatterService, AuthGuard ],
  bootstrap: [AppComponent]
})

export class AppModule { }
