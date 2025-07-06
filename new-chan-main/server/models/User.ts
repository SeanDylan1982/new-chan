import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password?: string;
  avatar?: string;
  isAnonymous: boolean;
  joinDate: Date;
  postCount: number;
  isActive: boolean;
  lastSeen: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: function() { return !this.isAnonymous; },
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return !this.isAnonymous; },
    minlength: 6
  },
  avatar: {
    type: String,
    default: null
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  postCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Remove duplicate index definitions - let Mongoose handle them automatically
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ isAnonymous: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isAnonymous) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (this.isAnonymous || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Update lastSeen on login
userSchema.methods.updateLastSeen = function() {
  this.lastSeen = new Date();
  return this.save();
};

export default mongoose.model<IUser>('User', userSchema);