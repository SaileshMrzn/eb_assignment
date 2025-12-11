import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Post } from 'src/posts/posts.schema';
import { PostsService } from 'src/posts/posts.service';
import { UserService } from 'src/users/users.service';
import type { JwtPayload } from 'src/auth/jwt-payload.type';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(GqlAuthGuard)
@Resolver()
export class HomeResolver {
  constructor(
    private readonly users: UserService,
    private readonly posts: PostsService,
  ) {}

  @Query(() => [Post])
  async home(
    @CurrentUser() user: JwtPayload,
    @Args('limit') limit: number = 10,
    @Args('cursor') cursor?: string,
  ) {
    const me = await this.users.getUserById(user.sub);

    const followingIds = me.following;

    if (!followingIds.length)
      throw new Error('You do not follow any users yet');

    const posts = await this.posts.getPostByIds(followingIds, limit, cursor);

    const nextCursor =
      posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

    return {
      posts,
      nextCursor,
    };
  }
}
