import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/users.schema';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      password: hashed,
    });

    return this._generateTokens(user._id.toString(), user.email);
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this._generateTokens(user._id.toString(), user.email);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userModel.findById(payload.sub);
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Access denied');

      const matches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!matches) throw new UnauthorizedException('Invalid refresh token');

      return this._generateTokens(user._id.toString(), user.email);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async _generateTokens(userId: string, email: string) {
    const accessToken = this.jwt.sign(
      { email },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '30m',
        subject: userId.toString(),
      },
    );

    const refreshToken = this.jwt.sign(
      {
        email,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
        subject: userId.toString(),
      },
    );

    //hashed refresh token
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashed,
    });

    return { accessToken, refreshToken };
  }
}
