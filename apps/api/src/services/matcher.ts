import BPResponse from '../models/responseModel';

/**
 * Compares response strings and return a match score
 */
function getMatchScore(userResponses, bpResponses) {

  // Generate the json objects that will be used for comparison
  let a = generateComparable(userResponses);
  let b = generateComparable(bpResponses);

  let a_length = Object.keys(a).length;
  let b_length = Object.keys(b).length;
  let minLength = (a_length > b_length) ? b_length : a_length;
  let maxLength = (a_length < b_length) ? b_length : a_length;
  var equivalency = 0;

  for (let i = 0; i < minLength; i++) {
    if (Object.values(a)[i] == Object.values(b)[i]) {
      equivalency++;
    }
  }

  var score = (equivalency / maxLength) * 100;
  return Math.round(score);
}

/**
 * Helper function to sort JSON object based on property
 */
var sortByProperty = (property) => {
  return function (a, b) {
    return ((a[property] === b[property]) ? 0 : ((a[property] < b[property]) ? 1 : -1));
  };
};

/**
 * Helper function to create responses object
 */
function generateComparable(responses) {
  let responseJSON = {};
  let sortedJSON = {};
  for (var key in responses) {
    responseJSON[responses[key].name] = responses[key].value
  }
  Object.keys(responseJSON).sort().forEach(function (key) {
    sortedJSON[key] = responseJSON[key];
  });
  return sortedJSON;
}

/**
 * Returns match score between user's reponses and 
 * a Block Producers reponses
 */
export var match = async (data) => {
  let userResponse = JSON.parse(data);
  let bp = await BPResponse.find();
  let matchResult = [];

  for (let i = 0; i < bp.length; i++) {
    let bp_data = bp[i]
    let bp_response = JSON.parse(bp_data.response);
    let score = getMatchScore(userResponse, bp_response);
    let skipped = 0;
    bp_response.forEach(resp => {
      if (resp.value == "null") {
        skipped++;
      }
    });
    matchResult.push({
      "name": bp_data.name,
      "url": bp_data.url,
      "bp_responses": bp_response,
      "match_score": score,
      "skipped": skipped
    });
  }
  return matchResult.sort(sortByProperty('match_score'));
}

