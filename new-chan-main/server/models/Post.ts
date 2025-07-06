import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: string;
  threadId: mongoose.Types.ObjectId;
  content: string;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  replyTo?: mongoose.Types.ObjectId;
  images: string[];
  isOP: boolean;
  isActive: boolean;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  threadId: {
    type: Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
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
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    default: null
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
  isOP: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
postSchema.index({ threadId: 1, createdAt: 1 });
postSchema.index({ author: 1 });
postSchema.index({ replyTo: 1 });

export default mongoose.model<IPost>('Post', postSchema);