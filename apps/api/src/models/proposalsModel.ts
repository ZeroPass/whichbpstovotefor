import * as mongoose from 'mongoose';

var Proposal = new mongoose.Schema({
  name: String,
  proposer: String,
  title: String,
  content: String
});

export default mongoose.model('proposals', Proposal);
