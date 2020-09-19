import { HttpService, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LiffLocalStrategy extends PassportStrategy(Strategy, 'liffLocal') {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
  ) {
    super({ usernameField: 'liffAccessToken' });
  }

  async validate(username: string): Promise<any> {
    // username === liffAccessToken
    let profile: {
      displayName: string;
      userId: string;
      pictureUrl: string;
      statusMessage: string;
    };

    try {
      profile = (
        await this.httpService
          .get('https://api.line.me/v2/profile', {
            headers: {
              Authorization: `Bearer ${username}`,
            },
          })
          .toPromise()
      ).data;
    } catch (e) {
      throw new UnauthorizedException();
    }

    let user;

    try {
      user = await this.authService.upsertLiffUserProfile(profile);
    } catch (error) {
      throw error;
    }

    return user;
  }
}
