const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  status : {
    type: Boolean,
    default: true
  },
  maildata: String,  
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  recivermail: String,
  subject: String
})


module.exports = mongoose.model("mail",userSchema);

