import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './posts.schema';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';

@UseGuards(GqlAuthGuard)
@Resolver()
export class PostsResolver {
  constructor(private posts: PostsService) {}

  @Query(() => [Post])
  listAllPosts(
    @Args('limit') limit: number = 20,
    @Args('skip') skip: number = 0,
  ) {
    return this.posts.listAllPosts(limit, skip);
  }

  @Query(() => Post)
  getPostById(@Args('id') id: string) {
    return this.posts.getPostById(id);
  }

  // Mutations
  @Mutation(() => Post)
  async createPost(
    @Args('authorId') authorId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @Args('file', { description: 'experimental' }) file?: any,
  ) {
    return this.posts.createPost(authorId, title, content, file);
  }

  @Mutation(() => Post)
  likePost(@Args('postId') postId: string, @Args('userId') userId: string) {
    return this.posts.likePost(postId, userId);
  }

  @Mutation(() => Post)
  unlikePost(@Args('postId') postId: string, @Args('userId') userId: string) {
    return this.posts.unlikePost(postId, userId);
  }

  @Mutation(() => Post)
  addComment(
    @Args('postId') postId: string,
    @Args('userId') userId: string,
    @Args('content') content: string,
  ) {
    return this.posts.addComment(postId, userId, content);
  }
}
