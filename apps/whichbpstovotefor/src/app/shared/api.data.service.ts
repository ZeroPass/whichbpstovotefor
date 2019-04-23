import { Injectable } from "@angular/core";
import { DataService } from "./data.service";
import { Result } from "./model/result.model";
import { Proposal } from "./model/proposal.model";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Vote } from "./model/vote.model";
import { environment } from "../../environments/environment";

@Injectable()
export class DataServiceImpl implements DataService {

  constructor(private http: HttpClient) { }

  getAllProposals(): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(environment.URL + "/api/proposals")
      .pipe(map(response => {
        let proposals = [];
        for (let i = 0; i < response.length; i++) {
          proposals.push(new Proposal(response[i].name, response[i].title, JSON.parse(response[i].content).content));
        }
        return proposals;
      }),
        catchError(e => throwError("Error - Unable to retrieve all proposals " + e)));
  }

  getAllResults(response: string[]): Observable<Result[]> {
    return this.http.post<Result[]>(environment.URL + "/api/votes", response)
      .pipe(catchError(e => throwError("Error - Unable to retrieve matching results " + e)));
  }

  getAllPreviousResponses(username: string): Observable<Vote[]> {
    return this.http.post<Vote[]>(environment.URL + "/api/responses", { account: username })
      .pipe(map(response => {
        let votes = [];
        for (let i = 0; i < response["rows"].length; i++) {
          votes.push(new Vote(response["rows"][i].proposal_name, response["rows"][i].voter, response["rows"][i].vote))
        }
        return votes;
      }),
        catchError(e => throwError("Error - Unable to retreive previous results" + e)));
  }
}