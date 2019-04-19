import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Proposal } from '../shared/model/proposal.model';
import { Vote } from '../shared/model/vote.model';
import { DataService } from '../shared/data.service';
import { Subscription, forkJoin } from 'rxjs';
import { ResponseDataService } from '../shared/response.data.service';
import { ScatterService } from '../shared/scatter.service';
import { environment } from 'apps/whichbpstovotefor/src/environments/environment';
import { log } from 'util';

const showdown = require('showdown');

@Component({
  selector: 'app-bpquestion',
  templateUrl: './bpquestion.component.html',
  styleUrls: ['./bpquestion.component.scss']
})
export class BPQuestionComponent implements OnInit, OnDestroy {

  isLoading: boolean;
  isDataLoading: boolean
  username: string;
  error: boolean;
  success: boolean;
  questionList: Proposal[];

  private id: number;
  private currentResponse: any[];
  private originalResponses: any[];
  private responses: any[];
  private proposals: any[];
  private getAllDataSub: Subscription;
  private hidden: any;
  private message: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private service: DataService,
    private responseService: ResponseDataService,
    private scatterService: ScatterService) {

    this.currentResponse = [];
    this.originalResponses = [];
    this.proposals = [];
    this.responses = [];
    this.hidden = [];
    this.isLoading = false;
    this.isDataLoading = false;
  }

  ngOnInit() {
    this.username = localStorage.getItem('activeUser');
    this.isDataLoading = true;

    this.getAllDataSub = forkJoin([this.service.getAllProposals(), this.service.getAllPreviousResponses(this.username)])
      .subscribe(
        resp => {
          this.isDataLoading = false;

          this.proposals = resp[0];
          let votes = resp[1];

          if (this.proposals !== undefined) {
            this.showQuestionList(this.proposals);
          } else {
            // todo - add call to error page for better UI error handling
            throw new Error("Proposals undefined");
          }

          // todo - improve logic here to remove the empty object creation for both the original responses and new responses objects
          // Create empty original response object
          for (let i = 0; i < this.proposals.length; i++) {
            this.originalResponses.push({ "name": this.proposals[i].name, "value": null });
            this.responses.push({ "name": this.proposals[i].name, "value": null });
          }

          // Check for any previously submitted responses
          if (votes !== undefined) {
            for (let i = 0; i < votes.length; i++) {
              this.currentResponse[votes[i].proposal_name] = votes[i].vote.toString();
              // Update original responses and responses based on recieved original responses
              for (let j = 0; j < this.originalResponses.length; j++) {
                if (this.originalResponses[j].name == votes[i].proposal_name) {
                  this.originalResponses[j].value = votes[i].vote.toString();
                  this.responses[j].value = votes[i].vote.toString();
                }
              }
            }
          }


        },
        error => {
          this.isDataLoading = false;

          if (!environment.production) {
            console.log(error);
          }
        }
      );
  }

  private showQuestionList(proposals: Proposal[]): void {
    if (proposals.length >= 0) {
      let converter = new showdown.Converter();

      proposals.forEach(prop => {
        prop.content = converter.makeHtml(prop.content);
      });

      this.questionList = proposals;
    } else {
      if (!environment.production) {
        console.log("API returned 0 questions.");
      }
    }
  }

  ngOnDestroy() {
    this.getAllDataSub.unsubscribe();
  }

  toggleHidden(i: string) {
    this.hidden[i] = !this.hidden[i]
  }

  submitResponses() {
    this.message = ""
    this.error = false;
    this.success = false;
    this.isLoading = true;

    let batch1: Vote[] = [];
    let batch2: Vote[] = [];

    if (this.responses.length == this.proposals.length) {
      // map each response to a vote
      this.responses.forEach((resp, idx) => {
        if (resp.value != this.originalResponses[idx].value) {
          if (batch1.length < 6) {
            batch1.push(new Vote(resp.name, this.username, parseInt(resp.value)));
          } else {
            batch2.push(new Vote(resp.name, this.username, parseInt(resp.value)));
          }
        }
      });

      // first submit batch 1 and update UI; then submit batch 2
      this.scatterService.send(batch1, batch2)
        .subscribe(
          resp => {
            // show submit success message
            if (!environment.production) {
              console.log(resp);
            }

            this.success = true;
            this.isLoading = false;
            this.message = "Responses successfully submitted!";

          }, error => {
            // show error and suggest re-submit
            if (!environment.production) {
              console.log(error);
            }

            this.error = true;
            this.isLoading = false;
            this.message = "Problem submitting responses please try again."
          }
        );

    } else {
      this.error = true;
      this.isLoading = false;
      this.message = "Must respond to all questions before submitting."
    }
  }

  onResponseSelected(name: string, value: string, index: number) {
    this.currentResponse[name] = value; // for html response persistance
    this.responses[index] = { "name": name, "value": value };
  }

  logout() {
    localStorage.clear();
    this.scatterService.logout();
    this.router.navigateByUrl('/bp');
  }

}
