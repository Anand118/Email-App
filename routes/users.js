const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect("mongodb://localhost/finalgmail");
const userSchema = mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true
  },
  name: String,
  mobile: String,
  password: String,
  profilepic: {
    type: String,
    default: 'def.jpg'
  },
  sendmails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mail'
  }],
  recivedmails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mail'
  }]
})

userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema);

