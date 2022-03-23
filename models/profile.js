const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
  userName: String,
  fname: String,
  lname: String,
  dob: String,
  bio: String,
  course: Array,
  employed: Boolean,
  skills: Array,
  //date since employment/graduation: String,
  linkedin: String,
  github: String,
  avatar: String,
  cv: String,
  //skills: Array,
  //email: String
})

module.exports.Profile = mongoose.model('Profile', profileSchema, 'Profile')