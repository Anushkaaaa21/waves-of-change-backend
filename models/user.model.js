const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return v === null || v === '' || v.length >= 10;
      },
      message: props => `${props.value} is not a valid phone number, it must be at least 10 digits long!`
    }
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Non-binary', 'Prefer not to say', ''],
      message: '{VALUE} is not a valid gender'
    },
  },
  country: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  
}, {
  timestamps: true,
  // === ADD THESE OPTIONS TO MAKE VIRTUALS APPEAR IN JSON/OBJECT OUTPUT ===
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
  // =====================================================================
});

// === ADD THIS VIRTUAL PROPERTY ===
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  // Handle cases where only one name is present
  if (this.firstName) return this.firstName;
  if (this.lastName) return this.lastName;
  return null; // Or return an empty string
});
// =================================

const User = mongoose.model('User', userSchema);
module.exports = User;