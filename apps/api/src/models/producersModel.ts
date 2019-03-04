import * as mongoose from 'mongoose';

var Producer = new mongoose.Schema({
  name: String,
  account: String,
  votes: String,
  url: String,
});

export default mongoose.model('producers', Producer);
