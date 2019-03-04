import * as eosBlockChain from "../services/eosblockchain";
import Producer from "../models/producersModel";
import Proposal from "../models/proposalsModel";
import BPResponse from "../models/responseModel";
import { environment } from "../environments/environment";

/**
 * Creates a new Producer record object
 */
export function newProducer(
  producerName,
  producerAccount,
  producerVotes,
  producerUrl,
) {
  return new Producer({
    name: producerName,
    account: producerAccount,
    votes: producerVotes,
    url: producerUrl,
  });
}

/** 
 * Creates a new Proposal record object
 */
export function newProposal(
  proposalName,
  proposerAccount,
  proposalTitle,
  proposalContent
) {
  return new Proposal({
    name: proposalName,
    proposer: proposerAccount,
    title: proposalTitle,
    content: proposalContent
  });
}

/**
 * 
 * Fetches a list of known block producers and adds them to the database
 * @param bpName 
 * @param bpUrl 
 * @param bpResponse 
 */
export function newResponse(
  bpName,
  bpAccount,
  bpUrl,
  bpResponse
) {
  return new BPResponse({
    name: bpName,
    account: bpAccount,
    url: bpUrl,
    response: bpResponse
  });
}

/** 
 * Fetches a list of known block producers and adds them to the database
 */
export async function createProducersList() {
  try {
    var result = await eosBlockChain.eosfetch.producers();
    result = JSON.parse(result);
    for (let i = 0; i < result.producers.length; i++) {
      let bp = result.producers[i];
      if (bp.name == null) {
        bp.name = bp.account;
      }
      if (bp.url == null) {
        bp.url = "";
      }
      // Check to see if the record already exists, we only want to add unique records
      Producer.findOne({ account: bp.account }, function (error, exists) {
        if (!error) {
          if (!exists) {
            var producer = newProducer(
              bp.name,
              bp.account,
              bp.vote_count,
              bp.website
            );
            producer.save().catch(error => console.log(error));
          } else {
            Producer.update(
              {},
              {
                $set: {
                  votes: bp.vote_count,
                  url: bp.website
                }
              }
            ).catch(error => console.log(error));
          }
        } else {
          console.log("Error: " + error);
          return;
        }
      });
    }
  } catch (e) {
    console.log("Error: " + e);
  }
}

/** 
 * Fetches proposals from the smart contract and adds them to the database
 */
export async function createProposalsList() {
  try {
    var result = await eosBlockChain.eosfetch.proposals();
    result = JSON.parse(result);
    for (let i = 0; i < result.rows.length; i++) {
      let prop = result.rows[i];
      // Check to see if the record already exists, we only want to add unique records
      Proposal.findOne({ name: prop.proposal_name }, function (error, exists) {
        if (!error) {
          if (!exists) {
            var proposal = newProposal(
              prop.proposal_name,
              prop.proposer,
              prop.title,
              prop.proposal_json
            );
            proposal.save().catch(error => console.log(error));
          } else {
            Proposal.update(
              {},
              {
                $set: {
                  title: prop.title,
                  content: prop.proposal_json
                }
              }
            ).catch(error => console.log(error));
          }
        } else {
          console.log("Error: " + error);
          return;
        }
      });
    }
  } catch (e) {
    console.log("Error: " + e);
  }
}

/** 
 * Fetches existing block producer's proposal responses and adds them to the database
 */
export async function createResponseList() {

  // Fetch the list of proposals from the db
  var surveyProposals = await Proposal.find({}, { name: 1 });
  var proposals = []
  for (let i = 0; i < surveyProposals.length; i++) {
    proposals.push(surveyProposals[i].name);
  }

  if (environment.production) {
    // Fetch Block Producer list from the database
    var blockProducers = await Producer.find({}, { name: 1, account: 1, url: 1 });
  } else {
    // Block Producer list from Kylin testnet
    var blockProducers = environment.BLOCK_PRODUCER_TEST_LIST;
  }

  // Loop through the list of block producers
  for (var i = 0; i < blockProducers.length; i++) {
    var bp = blockProducers[i];
    var votes;
    try {
      // Fetch all the votes made by the BP
      var result = await eosBlockChain.eosfetch.votes(bp.account);
      votes = JSON.parse(result);
    } catch (e) {
      console.log("Error fetching data for " + bp.account + " : " + e);
    }
    // Iterate through the votes responses and build the response string
    let responseString = getResponse(votes, proposals);
    // Check if BP Response object exists, if so update, if not create new object
    // and add to the database
    let exists = await BPResponse.count({ account: bp.account });
    if (exists > 0) {
      // Update existing record
      BPResponse.updateOne(
        { account: bp.account },
        {
          $set: {
            response: responseString
          }
        }
      ).catch(error => console.log(error));
    } else {
      // Create new record
      var responseObject = newResponse(bp.name, bp.account, bp.url, responseString);
      responseObject.save().catch(error => console.log(error));
    }
  }
}

/**
 * Populate the database
 */
export function populate() {
  createProposalsList();
  createProducersList();
  createResponseList();
}

/**
 * A helper function to create a string which represents the reponses
 * for each Block Producer
 * @param votesData 
 * @param proposals
 */
function getResponse(votesData, proposals) {
  var response = [];
  // Loop through the BPs Response data
  for (let i = 0; i < votesData.rows.length; i++) {
    let question = votesData.rows[i].proposal_name;
    if (proposals.indexOf(question) > -1) {
      let vote = votesData.rows[i].vote;
      response.push({ "name": question, "value": vote.toString() })
    }
  }
  return JSON.stringify(response);
}

