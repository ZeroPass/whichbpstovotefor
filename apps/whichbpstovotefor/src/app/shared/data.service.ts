import { Proposal } from "./model/proposal.model";
import { Injectable } from "@angular/core";
import { Result } from "./model/result.model";
import { Observable } from "rxjs";
import { Vote } from "./model/vote.model";

// describes the contract for a data service
@Injectable()
export abstract class DataService {

  abstract getAllProposals(): Observable<Proposal[]>;

  abstract getAllResults(response: string[]): Observable<Result[]>;

  abstract getAllPreviousResponses(username: string): Observable<Vote[]>;
}