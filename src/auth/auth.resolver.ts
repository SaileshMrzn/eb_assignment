import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './jwt-payload.type';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation()
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('username') username: string,
  ) {
    return this.auth.register(email, password, username);
  }

  @Mutation()
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.login(email, password);
  }

  @Mutation()
  async refreshToken(@Args('token') token: string) {
    return this.auth.refreshToken(token);
  }

  @Mutation()
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: JwtPayload) {
    return this.auth.logout(user.sub);
  }
}
