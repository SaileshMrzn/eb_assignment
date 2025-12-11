import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true, maxlength: 2000 })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true, trim: true, maxlength: 255 })
  title: string;

  @Prop({ type: String, required: true, trim: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  author: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: Types.ObjectId[];

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ type: Number, default: 0, min: 0 })
  likesCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  commentsCount: number;

  @Prop({ default: null, type: String }) imageUrl: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });

PostSchema.methods.addLike = function (userId: Types.ObjectId) {
  const idStr = userId.toString();
  if (!this.likes.some((u: Types.ObjectId) => u.toString() === idStr)) {
    this.likes.push(userId);
    this.likesCount = (this.likesCount || 0) + 1;
  }
};

PostSchema.methods.removeLike = function (userId: Types.ObjectId) {
  const idStr = userId.toString();
  const before = this.likes.length;
  this.likes = this.likes.filter((u: Types.ObjectId) => u.toString() !== idStr);
  if (this.likes.length !== before) {
    this.likesCount = Math.max(0, (this.likesCount || 0) - 1);
  }
};

PostSchema.methods.addComment = function (
  userId: Types.ObjectId,
  content: string,
) {
  this.comments.push({ user: userId, content, createdAt: new Date() });
  this.commentsCount = (this.commentsCount || 0) + 1;
};
