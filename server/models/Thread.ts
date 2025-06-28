import mongoose, { Document, Schema } from 'mongoose';

export interface IThread extends Document {
  _id: string;
  boardId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  lastReply: Date;
  replyCount: number;
  isSticky: boolean;
  isLocked: boolean;
  images: string[];
  tags: string[];
  isActive: boolean;
  updatedAt: Date;
}

const threadSchema = new Schema<IThread>({
  boardId: {
    type: Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastReply: {
    type: Date,
    default: Date.now
  },
  replyCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Invalid image URL format'
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
threadSchema.index({ boardId: 1, createdAt: -1 });
threadSchema.index({ boardId: 1, lastReply: -1 });
threadSchema.index({ boardId: 1, isSticky: -1, lastReply: -1 });
threadSchema.index({ author: 1 });
threadSchema.index({ tags: 1 });

// Update lastReply when new post is added
threadSchema.methods.updateLastReply = function() {
  this.lastReply = new Date();
  return this.save();
};

export default mongoose.model<IThread>('Thread', threadSchema);