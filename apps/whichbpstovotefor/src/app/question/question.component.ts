import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Proposal } from '../shared/model/proposal.model';
import { DataService } from '../shared/data.service';
import { Subscription } from 'rxjs';
import { ResponseDataService } from '../shared/response.data.service';
import { environment } from 'apps/whichbpstovotefor/src/environments/environment';

const showdown = require('showdown');

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit, OnDestroy {

  id: number;
  isDataAvailable: boolean;
  currentResponse: any;
  oldResponse: string;
  proposals: Proposal[];
  content: any;

  private name: string;
  private title: string;
  private response: any[];
  private routeSub: Subscription;
  private getAllProposalsSub: Subscription

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private service: DataService,
    private responseService: ResponseDataService) {

    this.isDataAvailable = false;
    this.currentResponse = null;
    this.response = [];
  }

  ngOnInit() {
    this.routeSub = this.route.params.subscribe(params => {
      this.id = +params['id'];
    });

    this.getAllProposalsSub = this.service.getAllProposals()
      .subscribe(
        proposals => {
          this.proposals = proposals;
          this.isDataAvailable = true;

          if (this.proposals !== undefined && this.id !== undefined) {
            this.showQuestion(this.id);
          } else {
            // todo - add call to error page for better UI error handling
            throw new Error("Proposals undefined");
          }
        },
        error => {
          if (!environment.production) {
            console.log(error);
          }
        }
      );
  }

  private showQuestion(qId: number): void {
    if (this.proposals[qId - 1] !== null) {
      let converter = new showdown.Converter();
      this.name = this.proposals[qId - 1].name;
      this.title = this.proposals[qId - 1].title;
      this.content = converter.makeHtml(this.proposals[qId - 1].content);
    } else {
      // todo - add call to error page for better UI error handling
      throw new Error("Question not found");
    }
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.getAllProposalsSub.unsubscribe();
    this.isDataAvailable = false;
  }

  goBack() {
    // todo - create proper routing state for previous route
    this.location.back();
    this.showQuestion(this.id - 1);
    this.oldResponse = this.response.pop();
  }

  private goNext() {
    if (this.id == this.proposals.length) {
      this.response.push(this.currentResponse);
      this.responseService.setResponse(this.response);
      this.router.navigateByUrl('/results');
    } else {
      this.router.navigate(['question', this.id + 1]);
      this.response.push(this.currentResponse);
      this.currentResponse = "";
      this.oldResponse = "";
      this.showQuestion(this.id + 1);
    }
  }

  onResponseSelected(value: string) {
    this.currentResponse = { "name": this.name, "value": value };
    this.goNext();
  }

  goClose() {
    this.router.navigateByUrl('');
  }

}
