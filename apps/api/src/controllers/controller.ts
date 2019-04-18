import Producer from "../models/producersModel";
import Proposal from "../models/proposalsModel";
import * as matcher from "../services/matcher";
import { eosfetch } from "../services/eosblockchain";
import { sortByKey } from "../helpers/util";
import * as ProposalTopList from '../helpers/proposalTopList';

import * as db from "../helpers/db"


// Fetches proposals
export function getProposals(req, res) {
  Proposal.find()
    .exec()
    .then(response => {
      let proposals = sortByKey(response, "name");
      console.log(proposals);
      res.status(200).json(proposals);
    })
    .catch(err => {
      res.status(200).json(err);
    });
}

// Fetches list of Block Producers
export function getProducersList(req, res) {
  Producer.find()
    .exec()
    .then(producers => {
      res.status(200).json(producers);
    })
    .catch(err => {
      res.status(200).json(err);
    });
}

// Returns the surveyresults
export async function getVotes(req, res) {
  let surveryResponse = JSON.stringify(req.body);
  matcher
    .match(surveryResponse)
    .then(responses => {
      res.status(200).json(responses);
    })
    .catch(err => {
      res.status(200).json(err);
    });
}

// Fetches respionses for a specific block producer
export async function getBPResponses(req, res) {

  let blockProducerAccount = req.body;
  // Fetch Proposal names
  var surveyProposals = await Proposal.find({}, { name: 1 });
  var proposals = []
  for (let i = 0; i < surveyProposals.length; i++) {
    proposals.push(surveyProposals[i].name);
  }

  eosfetch
    .votes(blockProducerAccount.account)
    .then(responses => {
      var result = JSON.parse(responses);
      // TODO: Improve this
      // Create empty response object to fill responses from the chain
      var surveyResponses = { "rows": [] };

      // Only return BP responses to our survey
      for (let i = 0; i < result.rows.length; i++) {
        let question = result.rows[i].proposal_name;
        if (proposals.includes(question)) {
          surveyResponses.rows.push(result.rows[i]);
        }
      }

      console.log(surveyResponses);

      res.status(200).json(surveyResponses);
    })
    .catch(err => {
      res.status(200).json(err);
    });
}
