import * as request from 'request-promise';
import { environment } from '../environments/environment';
import BigNumber from 'bignumber.js';
import Eos from 'eosjs';
import * as BigInt from 'big-integer';

const EOS_NODE_URL = environment.EOS_NODE_URL;
const PROPOSER = environment.PROPOSER;
const CONTRACT_NAME = environment.CONTRACT_NAME;
const TABLE_NAME_PROPOSALS = environment.TABLE_NAME_PROPOSALS;
const TABLE_NAME_VOTES = environment.TABLE_NAME_VOTES;

export const eosfetch = {
  /**
   * Retrieves the current Block Producers and a list of Block Producer Candidates 
   */
  producers: function () {
    var options = {
      url: 'https://www.alohaeos.com/feed/bpvalidate',
      method: 'GET'
    }
    return request(options);
  },

  /**
   * Retrieves a list of proposals based on the proposer account
   */
  proposals: function () {
    // Create upper and lower bounds
    let bounds = createBounds(PROPOSER);
    //set data to get proposals of specific account
    var dataString = '{"json":true,' +
      '"code":"' + CONTRACT_NAME + '",' +
      '"scope":"' + CONTRACT_NAME + '",' +
      '"table":"' + TABLE_NAME_PROPOSALS + '",' +
      '"index_position":2,' +
      '"key_type":"i64",' +
      '"lower_bound":"' + bounds.lowerBound + '",' +
      '"upper_bound":"' + bounds.upperBound + '"' +
      '}';
    //settings
    var options = {
      url: EOS_NODE_URL,
      method: 'POST',
      body: dataString
    };
    //send to the node
    return request(options);
  },

  /**
   * Retrieves votes of a specific account
   * @param voterName 
   * 
   */
  votes: function (voterName) {
    const encodedName = toBounds(voterName);
    var dataString = '{"json":true,' +
      '"code":"' + CONTRACT_NAME + '",' +
      '"scope":"' + CONTRACT_NAME + '",' +
      '"table":"' + TABLE_NAME_VOTES + '",' +
      '"limit":1000,' +
      '"index_position":3,' +
      '"key_type":"i128",' +
      '"lower_bound":"' + encodedName.lower_bound + '",' +
      '"upper_bound":"' + encodedName.upper_bound + '"' +
      '}';
    var options = {
      url: EOS_NODE_URL,
      method: 'POST',
      body: dataString
    };
    //send to the node
    return request(options);
  }
}

/**
 * Helper function for generating upper and lower bounds 
 * to fetch a list of proposals submitted by an account
 * @param name
 */
function createBounds(name) {
  let ENCODED_NAME = new BigNumber(Eos.modules.format.encodeName(name, false));
  let lowerBound = ENCODED_NAME.toString();
  let upperBound = ENCODED_NAME.plus(1).toString();
  return {
    'lowerBound': lowerBound,
    'upperBound': upperBound
  }
}

function charToSymbol(c) {
  c = (c + '').charCodeAt(0);
  var a = 'a'.charCodeAt(0);
  var z = 'z'.charCodeAt(0);
  var s1 = '1'.charCodeAt(0);
  var s5 = '5'.charCodeAt(0);
  if (c >= a && c <= z)
    return BigInt((c - a) + 6);
  if (c >= s1 && c <= s5)
    return BigInt((c - s1) + 1);
  return BigInt(0);
}

function stringToName1(str) {
  var name = BigInt(0);
  var name1 = BigInt(0);
  var tmp = str.split('');
  var list = [];
  var i = 0;

  for (; i < tmp.length; i++) {
    if ((tmp[i] + '').charCodeAt(0) > 0)
      list.push(tmp[i]);
    else
      break;
  }

  var len = Math.min(list.length, 12);
  for (i = 0; i < len && i <= 12; i++) {
    var c = charToSymbol(list[i]);
    var d;
    if (i < 8) {
      var diff = 32 - 5 * (i + 1);
      d = BigInt(c.and(0x1f).shiftLeft(diff));
      name = name.or(d);
      if (diff < 0) {
        d = BigInt(c.and(0x1f).shiftLeft(32 + diff));
        name1 = name1.or(d);
      }
    }
    else if (i < 12) {
      c = BigInt(c.and(0x1f).shiftLeft(32 - 5 * ((i - 6) + 1) + 2));
      name1 = name1.or(c);
    }
    else
      c = c.and(0x0f);
  }
  return { big: name, little: name1 };
}

const changeEndianness = (string) => {
  const result = [];

  while (string.length < 8) {
    string = string + '0';
  }

  let len = string.length - 2;
  while (len >= 0) {
    result.push(string.substr(len, 2));
    len -= 2;
  }
  return result.join('');

}

function toBounds(proposal_name) {
  var integer_name = stringToName1(proposal_name)
  var hex_name_big = changeEndianness(integer_name.big.toString(16));
  var hex_name_little = changeEndianness(integer_name.little.toString(16));
  var hex_name = hex_name_little + hex_name_big + "";
  var lb = "0x0000000000000000" + hex_name;
  var ub = "0xffffffffffffffff" + hex_name;
  return { lower_bound: lb, upper_bound: ub }
}