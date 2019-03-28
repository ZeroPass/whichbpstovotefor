var request = require('request');
var fs = require('fs');

var url = 'http://s3.amazonaws.com/api.eosvotes.io/eosvotes/tallies/latest.json';

var _DATETIME = 'datetime';
var _TOPLIST = 'toplist';
var _SUCCESS = 'success';
var _DESCRIPTION = 'description';


//it works only with positive numbers, the size must be 1 or more
class TopList {
  size = 0;
  array = new Array();
  lowestTopValue = 0;

  constructor(size) {
    this.size = size;
  }

  // add an value to the top list
  add(item, value) {
    if (value < this.lowestTopValue) {
      return false;
    }

    this.array.push([value, item]);
    var i = this.array.length - 1;
    item = this.array[i];
    while (i > 0 && item[0] < this.array[i - 1][0]) {
      this.array[i] = this.array[i - 1];
      i -= 1;
    }
    this.array[i] = item;
    this.array = this.array.slice(-6);

    this.lowestTopValue = this.array[0][0];
    return true;
  }

  toJson() {
    var json = {};
    var date = new Date();
    json[_SUCCESS] = true;
    json[_DATETIME] = date.getTime();
    json[_TOPLIST] = [];

    for (var j = 0; j < this.array.length; j++) {
      var obj = this.array[j][1];
      json[_TOPLIST].push(obj['proposal']);
    }
    //console.log("Size of array", this.array.length);
    //return JSON.stringify(json);
    return json;
  }

  //unused function at this moment, maybe in the future we will make public API that serves top proposals
  writeTofile(filepath, name, json) {
    fs.writeFile(filepath + name, json, 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
      console.log('The file was saved!');
    });
  }
}


//it returns json/dictonary with negative success sign
function failedJson(error) {
  var json = {};
  json[_SUCCESS] = false;
  json[_DESCRIPTION] = error;
  return json;
}

//get top 6 proposals (by votes)
export function getTop(callback) {
  request.get({
    url: url,
    json: true,
    headers: {'User-Agent': 'request'}
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
      callback(false, failedJson(err));
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
      callback(false, failedJson('Status:' + res.statusCode));
    } else {
      //list of top 6 proposals (number of votes)
      var top = new TopList(6);
      for (var key in data) {
        //check if item is in the top 6
        top.add(data[key], data[key]['stats']['staked']['total']);
      }
      callback(true, top.toJson());
    }
  });
}
