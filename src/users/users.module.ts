import { Module } from '@nestjs/common';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { Post, PostSchema } from 'src/posts/posts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  providers: [UserResolver, UserService],
})
export class UserModule {}
