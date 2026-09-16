import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as OktaJwtVerifier from '@okta/jwt-verifier';
import { Request } from 'express';
import * as process from 'process';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const oktaJwtVerifier = new OktaJwtVerifier({
      issuer: process.env.OKTA_ISSUER ?? process.env.ISSUER,
    });

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not present');
    }

    try {
      const oktaToken = await oktaJwtVerifier.verifyAccessToken(
        token,
        `${process.env.OKTA_AUDIENCE ?? process.env.AUDIENCE}`,
      );
      request['user'] = oktaToken.claims.sub;
      return true;
    } catch (error) {
      console.debug('Error while verifying tokens', error);
      throw new UnauthorizedException('Token not valid');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
