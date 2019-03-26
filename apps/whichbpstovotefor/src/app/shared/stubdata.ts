import { Result } from "./model/result.model";
import { Proposal } from "./model/proposal.model";
import { Vote } from "./model/vote.model";

export const RESULTS: Result[] =
[
    {
        name: "eos_for_real",
        match_score: 50,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "tokensFly",
        match_score: 80,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "chargeupeos",
        match_score: 100,
        responses: [1,0,1,1,3,1],
        url: "http://google.com"
    },
    {
        name: "eos_for_real",
        match_score: 50,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "tokensFly",
        match_score: 80,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "chargeupeos",
        match_score: 100,
        responses: [1,0,1,1,3,1],
        url: "http://google.com"
    },
    {
        name: "eos_for_real",
        match_score: 50,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "tokensFly",
        match_score: 80,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "chargeupeos",
        match_score: 100,
        responses: [1,0,1,1,3,1],
        url: "http://google.com"
    },
    {
        name: "eos_for_real",
        match_score: 50,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "tokensFly",
        match_score: 80,
        responses: [1,0,1,1,1,1],
        url: "http://google.com"
    },
    {
        name: "chargeupeos",
        match_score: 100,
        responses: [1,0,1,1,3,1],
        url: "http://google.com"
    }
       
];

export const PROPOSALS: Proposal[] = [
    {
        name: "prop1",
        title: "Some cool EOS question?",
        content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,<br><br> remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.<br><br> [https://google.com](https://google.com)"
    }, {
        name: "prop2",
        title: "Some cool EOS question 2?",
        content: "Some accurate supporting description of the question to help you understand what we are asking."
    }
];

export const VOTES: Vote[] = [
    {
        proposal_name: "prop1",
        voter: "bpforlife",
        vote: 1,
        vote_json: "{}"
    }, {
        proposal_name: "prop2",
        voter: "bpforlife",
        vote: 0,
        vote_json: "{}"
    }
];