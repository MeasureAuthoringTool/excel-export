import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as OktaJwtVerifier from '@okta/jwt-verifier';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const oktaJwtVerifier = new OktaJwtVerifier({
      issuer: process.env.ISSUER,
      clientId: process.env.CLIENT_ID,
    });

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not present');
    }
    try {
      const oktaToken = await oktaJwtVerifier.verifyAccessToken(
        token,
        'api://default',
      );
      request['user'] = oktaToken.claims.sub;
    } catch {
      throw new UnauthorizedException('Token not valid');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
