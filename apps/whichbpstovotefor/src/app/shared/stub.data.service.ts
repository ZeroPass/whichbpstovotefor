import { Injectable } from '@angular/core';
import { PROPOSALS, RESULTS, VOTES } from './stubdata';
import { DataService } from './data.service';
import { Proposal } from './model/proposal.model';
import { Result } from './model/result.model';
import { Observable, of } from 'rxjs';
import { Vote } from './model/vote.model';

@Injectable()
export class StubDataServiceImpl implements DataService {

  constructor() { }

  getAllProposals(): Observable<Proposal[]> {
    return of(PROPOSALS);
  }

  getAllResults(response: string[]): Observable<Result[]> {
    return of(RESULTS);
  }

  getAllPreviousResponses(username: string): Observable<Vote[]> {
    return of(VOTES);
  }

}