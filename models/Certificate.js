const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a certificate title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  genre: {
    type: String,
    required: [true, 'Please add a genre or category'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'Please provide the external course link'],
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please use a valid URL with HTTP or HTTPS'
    ]
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Draft'
  },
  thumbnail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);