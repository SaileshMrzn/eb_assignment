import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UserService } from './users.service';
import { User } from './users.schema';

@Resolver()
export class UserResolver {
  constructor(private users: UserService) {}

  @Query(() => [User])
  listAllUsers(
    @Args('limit') limit: number = 20,
    @Args('skip') skip: number = 0,
  ) {
    return this.users.listAllUsers(limit, skip);
  }

  @Query(() => [User])
  getUserById(@Args('id') id: string) {
    return this.users.getUserById(id);
  }

  @Query()
  getUserWithPosts(@Args('id') id: string) {
    return this.users.getUserWithPosts(id);
  }

  @Mutation()
  followUser(
    @Args('fromId') fromId: string,
    @Args('targetId') targetId: string,
  ) {
    return this.users.followUser(fromId, targetId);
  }

  @Mutation()
  unfollowUser(
    @Args('fromId') fromId: string,
    @Args('targetId') targetId: string,
  ) {
    return this.users.unfollowUser(fromId, targetId);
  }
}
