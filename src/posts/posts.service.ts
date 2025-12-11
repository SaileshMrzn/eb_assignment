import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Model, Types } from 'mongoose';
import { join } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async createPost(
    authorId: string,
    title: string,
    content: string,
    file: any,
  ): Promise<PostDocument> {
    let imageUrl: string | undefined;

    if (file) {
      const { createReadStream, filename, mimetype } = await file;

      if (!mimetype.startsWith('image/')) {
        throw new BadRequestException('Only image uploads are allowed.');
      }

      const uploadDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      const ext = filename.split('.').pop();
      const newFileName = `${Date.now()}-${uuidv4()}.${ext || 'jpg'}`;
      const absolutePath = join(uploadDir, newFileName);
      imageUrl = `/uploads/${newFileName}`;

      await new Promise<void>((resolve, reject) => {
        const stream = createReadStream();
        const out = createWriteStream(absolutePath);
        stream
          .pipe(out)
          .on('finish', () => resolve())
          .on('error', (err) => {
            console.error('File write error', err);
            reject(new Error('File upload failed.'));
          });
      });
    }

    const post = await this.postModel.create({
      author: new Types.ObjectId(authorId),
      title,
      content,
      imageUrl,
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

  async getPostByIds(ids: any[], limit: number = 10, cursor?: string) {
    const query: any = { author: { $in: ids } };

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('author', '_id email username')
      .lean()
      .exec();

    if (!posts.length)
      throw new Error('No any posts found for specified users');

    return posts;
  }
}
