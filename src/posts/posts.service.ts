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
    file?: any,
  ): Promise<PostDocument> {
    let imageUrl: string | undefined;

    // handle file upload
    if (file) {
      const { createReadStream, filename, mimetype } = await file;

      // validate if image
      if (!mimetype.startsWith('image/')) {
        throw new BadRequestException('only image uploads are allowed');
      }

      // ensure upload directory exists
      const uploadDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // generate unique file name
      const ext = filename.split('.').pop() || 'jpg';
      const newFileName = `${Date.now()}-${uuidv4()}.${ext}`;
      const absolutePath = join(uploadDir, newFileName);
      imageUrl = `/uploads/${newFileName}`;

      // save the file to the filesystem
      await new Promise<void>((resolve, reject) => {
        const stream = createReadStream();
        const out = createWriteStream(absolutePath);
        stream
          .pipe(out)
          .on('finish', () => resolve())
          .on('error', (err) => {
            console.error('file write error', err);
            reject(new Error('file upload failed'));
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
    const queryLimit = Math.min(limit, 100); // max 100 posts at once
    const querySkip = Math.max(skip, 0); // ensure non negative skip value

    const posts = await this.postModel
      .find({})
      .sort({ createdAt: -1 })
      .skip(querySkip)
      .limit(queryLimit)
      .lean();

    return posts;
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

    // return the post as plain object
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

    // cursor for pagination (points to last fetched post)
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
