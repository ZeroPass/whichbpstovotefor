import * as mongoose from 'mongoose';

var BPResponse = new mongoose.Schema({
  name: String,
  account: String,
  url: String,
  response: String
});

export default mongoose.model('responses', BPResponse);
