// Object modeling a Block Producer vote
export class Vote {
    
    proposal_name: string;
    voter: string;
    vote: number;
    vote_json: string;

    constructor(proposal_name, voter, vote) {
        this.proposal_name = proposal_name;
        this.voter = voter;
        this.vote = vote;
        this.vote_json = JSON.stringify({});
    }
}