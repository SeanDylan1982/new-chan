import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  _id: string;
  name: string;
  description: string;
  category: string;
  threadCount: number;
  postCount: number;
  lastActivity: Date;
  isNSFW: boolean;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema = new Schema<IBoard>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4,
    maxlength: 20,
    validate: {
      validator: function(v: string) {
        return /^\/[a-zA-Z0-9_-]+\/$/.test(v);
      },
      message: 'Board name must be in format /boardname/'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Entertainment', 'Creative', 'General'],
    default: 'General'
  },
  threadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  postCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isNSFW: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Remove duplicate index definitions
// boardSchema.index({ name: 1 });
// boardSchema.index({ category: 1 });
// boardSchema.index({ isActive: 1 });
// boardSchema.index({ lastActivity: -1 });

// Update lastActivity when board is accessed
boardSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

export default mongoose.model<IBoard>('Board', boardSchema);