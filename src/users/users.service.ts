import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from 'src/posts/posts.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async followUser(
    fromId: string,
    targetId: string,
  ): Promise<UserDocument | null> {
    if (fromId === targetId) throw new Error('Cannot follow yourself');

    const alreadyFollowed = await this.userModel.exists({
      _id: fromId,
      following: { $in: [targetId] },
    });

    if (alreadyFollowed) {
      throw new Error('You already follow this user');
    }

    await this.userModel.findByIdAndUpdate(fromId, {
      $addToSet: { following: targetId },
      $inc: { followingCount: 1 },
    });

    const updatedTarget = await this.userModel.findByIdAndUpdate(
      targetId,
      {
        $addToSet: { followers: fromId },
        $inc: { followersCount: 1 },
      },
      { new: true },
    );

    if (!updatedTarget) {
      throw new NotFoundException('Target user not found');
    }

    return updatedTarget;
  }

  async unfollowUser(
    fromId: string,
    targetId: string,
  ): Promise<UserDocument | null> {
    if (fromId === targetId) throw new Error('Cannot unfollow yourself');

    const isFollowing = await this.userModel.exists({
      _id: fromId,
      following: { $in: [targetId] },
    });

    if (!isFollowing)
      throw new Error("You do not follow this user or user doesn't exist");

    await this.userModel.findByIdAndUpdate(fromId, {
      $pull: { following: targetId },
      $inc: { followingCount: -1 },
    });

    const updatedTarget = await this.userModel.findByIdAndUpdate(
      targetId,
      { $pull: { followers: fromId }, $inc: { followersCount: -1 } },
      { new: true },
    );

    return updatedTarget;
  }

  async listAllUsers(limit = 20, skip = 0): Promise<User[] | null> {
    const users = await this.userModel.find({}).skip(skip).limit(limit).lean();
    if (!users) throw new NotFoundException('Failed to get users');
    return users;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUserWithPosts(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');

    const posts = await this.postModel
      .find({ author: new Types.ObjectId(id) })
      .sort({ createdAt: -1 })
      .lean<Post>();

    return { user, posts };
  }
}
