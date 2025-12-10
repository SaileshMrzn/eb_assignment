import { Module } from '@nestjs/common';
import { HomeResolver } from './home.resolver';
import { UserModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [UserModule, PostsModule],
  providers: [HomeResolver],
})
export class HomeModule {}
