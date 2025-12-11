import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  // override getRequest to extract request from graphql context
  getRequest(context: ExecutionContext) {
    // convert execution context to graphql context
    const gqlContext = GqlExecutionContext.create(context);

    // return the underlying request object for jwt strategy
    return gqlContext.getContext().req;
  }
}
