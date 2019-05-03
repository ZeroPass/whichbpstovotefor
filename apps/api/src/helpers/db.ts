import * as eosBlockChain from '../services/eosblockchain';
import Producer from '../models/producersModel';
import Proposal from '../models/proposalsModel';
import BPResponse from '../models/responseModel';
import * as ProposalTopList from '../helpers/proposalTopList';

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
  proposalContent,
  stakedEos
) {
  return new Proposal({
    name: proposalName,
    proposer: proposerAccount,
    title: proposalTitle,
    content: proposalContent,
    stakedEOS: stakedEos
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
        bp.url = '';
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
              {
                account: bp.account
              },
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
    //var topProposals = await ProposalTopList.getTop()
    ProposalTopList.getTop((success, data) => {
      if (!success) {
        console.log('Error:', data['description']);
      }
      else {
        Proposal.deleteMany({}, function (error) {
          if (error) {
            console.log("Error occured: ", error)
          }
          console.log("Delete all");
        });

        for (var j = 0; j < data['toplist'].length; j++) {
          let prop = data['toplist'][j];
          // Check to see if the record already exists, we only want to add unique records
          Proposal.findOne({ name: prop['proposal_name'] }, function (error, exists) {
            if (!error) {
              if (!exists) {
                var proposal = newProposal(
                  prop['proposal_name'],
                  prop['proposer'],
                  prop['title'],
                  prop['proposal_json'],
                  prop['staked_eos']
                );
                proposal.save().catch(error => console.log(error));
              } else {
                Proposal.update(
                  {
                    name: prop['proposal_name']
                  },
                  {
                    $set: {
                      title: prop['title'],
                      content: prop['proposal_json']
                    }
                  }
                ).catch(error => console.log(error));
              }
            } else {
              console.log('Error: ' + error);
              return;
            }
          });
        }
      }
    });
    // previous code
    /*
    var result = await eosBlockChain.eosfetch.proposals();
    result = JSON.parse(result);

    for (let i = 0; i < result.rows.length; i++) {
      let prop = result.rows[i];
      // Check to see if the record already exists, we only want to add unique records
      Proposal.findOne({name: prop.proposal_name}, function (error, exists) {
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
              {
                name: prop.proposal_name
              },
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
    }*/
  } catch (e) {
    console.log("Error: " + e);
  }
}

/**
 * Fetches existing block producer's proposal responses and adds them to the database
 */
export async function createResponseList() {

  // Fetch the list of proposals from the db
  var surveyProposals = await Proposal.find({}, { name: 1, title: 1 });
  var proposals = [];
  for (let i = 0; i < surveyProposals.length; i++) {
    proposals.push({
      "name": surveyProposals[i].name,
      "title": surveyProposals[i].title
    });
  }

  var blockProducers = await Producer.find({}, { name: 1, account: 1, url: 1 });

  // Loop through the list of block producers
  for (var i = 0; i < blockProducers.length; i++) {
    var bp = blockProducers[i];
    var votesNonProxy;
    var votesOnProxy = null;
    try {
      // Fetch all the votes made by the BP
      var result = await eosBlockChain.eosfetch.votes(bp.account);
      votesNonProxy = JSON.parse(result);
      //if in votes is empty go to check if proxy vote exists
      //next day continoue here please:)
      var hasVoterProxy = await getProxyIfExists(bp.account);
      if (hasVoterProxy != "") {
        var resultProxyVotes = await eosBlockChain.eosfetch.votes(hasVoterProxy);
        votesOnProxy = JSON.parse(resultProxyVotes);
      }
    } catch (e) {
      console.log('Error fetching data for ' + bp.account + ' : ' + e);
    }
    // Iterate through the votes responses and build the response string
    let responseString = getResponse(votesNonProxy, votesOnProxy, proposals);
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
function getResponse(votesDataNonProxy, votesDataProxy, proposals) {
  var response = [];

  // Populate proposals object with null values
  proposals.forEach(function (proposal) {
    response.push({ 'name': proposal.name, 'title': proposal.title, 'value': 'null' });
  });

  //if there are any data in proxy response
  if (votesDataProxy != null && votesDataProxy.rows.length > 0){
    // Loop through the BPs Response data on voted proxy
    for (let i = 0; i < votesDataProxy.rows.length; i++) {
      let question = votesDataProxy.rows[i].proposal_name;
      // Check in the BPs response if they answered one of the proposals in the db
      if (proposals.some(p => p.name === question)) {
        let vote = votesDataProxy.rows[i].vote;
        response.forEach(function (x) {
          if (x.name == question) {
            x.value = vote.toString()
          }
        });
      }
    }
  }

  // Loop through the BPs Response data - the answer on main account is more valuable (answer from proxy is overwritten)
  for (let i = 0; i < votesDataNonProxy.rows.length; i++) {
    let question = votesDataNonProxy.rows[i].proposal_name;
    // Check in the BPs response if they answered one of the proposals in the db
    if (proposals.some(p => p.name === question)) {
      let vote = votesDataNonProxy.rows[i].vote;
      response.forEach(function (x) {
        if (x.name == question) {
          x.value = vote.toString()
        }
      });
    }
  }
  return JSON.stringify(response);
}

export async function getProxyIfExists(bpAccount) {
  try {
    var result = await eosBlockChain.eosfetch.proxy(bpAccount);
    result = JSON.parse(result);

    if (result.rows.length == 0)
      return '';

    return result.rows[0].proxy;
  } catch (e) {
    return '';
    console.log('Error: ' + e);
  }
}

