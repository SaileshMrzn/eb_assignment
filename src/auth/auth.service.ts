import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

  async register(email: string, password: string, username: string) {
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email }, { username }],
      })
      .lean();

    if (existingUser) {
      throw new ConflictException('Email or username is already taken.');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    // generate tokens
    const tokens = await this._generateTokens(user);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // generate tokens
    const tokens = await this._generateTokens(user);

    return {
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // verify refresh token
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // verify correct user
      const user = await this.userModel.findById(payload.sub).lean();
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('access denied');
      }

      // compare provided refresh token with hashed token in db
      const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isMatch) {
        throw new UnauthorizedException('invalid refresh token');
      }

      // generate new access and refresh tokens
      return this._generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    });
    return true;
  }

  private async _generateTokens(user: User & { _id: any }) {
    const userId = user._id.toString();
    const email = user.email;
    const tokenVersion = user.tokenVersion || 0;
    // generate access token
    const accessToken = this.jwt.sign(
      { email, tokenVersion },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '30m',
        subject: userId,
      },
    );

    // generate refresh token
    const refreshToken = this.jwt.sign(
      { email, tokenVersion },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
        subject: userId,
      },
    );

    // hash the refresh token before saving in database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: hashedRefreshToken,
    });

    return { accessToken, refreshToken };
  }
}
