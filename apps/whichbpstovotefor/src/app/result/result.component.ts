import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../shared/data.service';
import { Result } from '../shared/model/result.model';
import { Subscription } from 'rxjs';
import { ResponseDataService } from '../shared/response.data.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {

  results: Result[];
  isDataLoading: boolean;

  private getAllResultsSub: Subscription;

  constructor(private router: Router, private service: DataService, private responseService: ResponseDataService) {
    this.service = service;
    this.responseService = responseService;
    this.isDataLoading = false;
  }

  ngOnInit() {
    this.isDataLoading = true;
    let userResponse = this.responseService.getResponse();
    if (userResponse != undefined) {
      this.getAllResultsSub = this.service.getAllResults(userResponse)
        .subscribe(
          results => {
            this.results = results;
            this.isDataLoading = false;
          },
          error => {
            if (!environment.production) {
              console.log(error);
            }
          }
        );
    } else {
      console.log("Session expired - routing to restart survey");
      this.startOver();
    }
  }

  startOver() {
    this.router.navigateByUrl('/question/1');
  }

  goHome() {
    this.router.navigateByUrl('');
  }

}

// 1/6=17 2/6=33 3/6=50 4/6=67 5/6=83 6/6=100