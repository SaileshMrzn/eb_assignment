import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('Missing JWT_SECRET environment variable');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  // validate method called by passport after decoding jwt
  async validate(payload: {
    sub: string;
    email: string;
    tokenVersion: number;
  }) {
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException();
    }
    // return minimal user info for gql context
    return { sub: payload.sub, email: payload.email };
  }
}
