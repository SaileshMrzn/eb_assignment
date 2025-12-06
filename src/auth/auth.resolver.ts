import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => String)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.register(email, password);
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    return this.auth.login(email, password);
  }

  @Mutation(() => String)
  async refreshToken(@Args('token') token: string) {
    return this.auth.refreshToken(token);
  }

  @Query(() => String)
  health() {
    return 'ok';
  }
}
