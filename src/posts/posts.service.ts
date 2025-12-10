import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async createPost(
    authorId: string,
    title: string,
    content: string,
  ): Promise<PostDocument> {
    const post = await this.postModel.create({
      author: new Types.ObjectId(authorId),
      title,
      content,
    });

    return post;
  }

  async listAllPosts(limit = 20, skip = 0): Promise<Post[]> {
    return this.postModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async getPostById(id: string): Promise<Post> {
    const post = await this.postModel.findById(id).lean();
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deleteById(id: string): Promise<void> {
    const res = await this.postModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Post not found');
  }

  async likePost(postId: string, userId: string): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    (post as any).addLike(new Types.ObjectId(userId));
    await post.save();
    return post.toObject();
  }

  async unlikePost(postId: string, userId: string): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    (post as any).removeLike(new Types.ObjectId(userId));
    await post.save();
    return post.toObject();
  }

  async addComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<Post> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    (post as any).addComment(new Types.ObjectId(userId), content);
    await post.save();
    return post.toObject();
  }

  async getPostByIds(ids: any[]): Promise<Post[]> {
    const posts = await this.postModel
      .find({
        author: { $in: ids },
      })
      .sort({ createdAt: -1 })
      .populate('author', '_id email')
      .lean()
      .exec();

    if (!posts.length)
      throw new Error('No any posts found for specified users');

    return posts;
  }
}
