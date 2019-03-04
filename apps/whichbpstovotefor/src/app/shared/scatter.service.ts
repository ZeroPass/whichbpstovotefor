import { Injectable } from "@angular/core";
import { Observable, from, throwError } from "rxjs";

import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import { Vote } from "./model/vote.model";
import { switchMap, map } from "rxjs/operators";
import { network, contractName } from 'apps/whichbpstovotefor/src/environments/environment';

// handles connection and transactions via Scatter 
@Injectable()
export class ScatterService {

  private scatter: any;

  constructor() {
    ScatterJS.plugins(new ScatterEOS());

    this.scatter = ScatterJS.scatter;
  }

  /**
   * Create Scatter connection to login and get account/identity of current user
   */
  login(): Observable<any> {
    return from(ScatterJS.scatter.connect('whichbptovotefor').then(connected => {

      // If the user does not have Scatter or it is Locked or Closed throw error
      if (!connected) {
        throwError("Error - User does not have Scatter or Application is closed");
      }

      const requiredFields = { accounts: [network] };
      return this.scatter.getIdentity(requiredFields).then(() => {

        const account = this.scatter.identity.accounts.find(x => x.blockchain === 'eos');
        localStorage.setItem('activeUser', account.name);
        return account;

      }).catch(error => {
        // The user rejected this request, or doesn't have the appropriate requirements.
        return error;
      });
    }));
  }

  logout(): void {
    this.scatter.forgetIdentity();
  }

  /**
   * First check login and get account, then createTransaction for first batch
   * then createTransaction for second batch. 
   * 
   * Note: if batch1 fails, batch2 will not execute.
   */
  send(batch1, batch2): Observable<any> {
    const eosOptions = { expireInSeconds: 60 };
    const eos = this.scatter.eos(network, Eos, eosOptions);

    if (batch2.length == 0) {
      return this.login()
        .pipe(switchMap(account =>
          this.createTransaction(eos, batch1, account).pipe(
            map(resp => ([account, resp]))
          )));

    } else {
      return this.login()
        .pipe(switchMap(account =>
          this.createTransaction(eos, batch1, account).pipe(
            map(resp => ([account, resp]))
          )))
        .pipe(switchMap(([account, resp]) =>
          this.createTransaction(eos, batch2, account)
        ));
    }
  }

  private createTransaction(eos: any, batch: Vote[], account: any): Observable<any> {
    let actions = [];

    batch.forEach(element => {
      actions.push({
        account: contractName,
        name: 'vote',
        authorization: [{
          actor: account.name,
          permission: account.authority
        }],
        data: element
      })
    });

    return from(eos.transaction({ actions }));
  }
}