// auth-service/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const allowedRoles = ['resident', 'staff', 'advocate'];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required.'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long.'],
      maxlength: [100, 'Full name must not exceed 100 characters.'],
    },
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long.'],
      maxlength: [30, 'Username must not exceed 30 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
    },
    role: {
      type: String,
      enum: allowedRoles,
      default: 'resident',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function preSave(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare plain password with hashed password
userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;