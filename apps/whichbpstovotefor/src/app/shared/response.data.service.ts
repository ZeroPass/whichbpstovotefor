import { Injectable } from "@angular/core";

@Injectable()
export class ResponseDataService {

  private response: string[];

  constructor() { }

  setResponse(response: string[]): void {
    this.response = response;
    sessionStorage.setItem('response', response.toString());
  }

  getResponse(): string[] {
    if (this.response != undefined) {
      return this.response;
    } else {
      return sessionStorage.getItem('response').split(',');
    }
  }
}