import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  refreshToken?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User', default: [] }] })
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User', default: [] }] })
  following: Types.ObjectId[];

  @Prop({ default: 0 })
  followersCount: number;

  @Prop({ default: 0 })
  followingCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
