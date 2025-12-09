import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { UserModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
      graphiql: true,
    }),

    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/',
    ),

    AuthModule,
    PostsModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
