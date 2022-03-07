const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  userName: String,
  fname: String,
  lname: String,
  dob: Number,
  bio: String,
  course: String,
  employed: Boolean,
  //skills: Array,
  //date since employment/graduation: String,
  linkedin: String,
  github: String,
  cv: String,
})

module.exports.Profile = mongoose.model('Profile', profileSchema, 'Profile')