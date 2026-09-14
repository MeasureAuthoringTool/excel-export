import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Jwt } from '@okta/jwt-verifier';
import * as process from 'process';

const mockVerifyAccessToken = jest.fn();

jest.mock('@okta/jwt-verifier', () => {
  return jest.fn().mockImplementation(() => {
    return {
      verifyAccessToken: mockVerifyAccessToken,
    };
  });
});

function contextWithHeaders(headers: Record<string, string>): ExecutionContext {
  const mockExecutionContext = createMock<ExecutionContext>();
  jest
    .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
    .mockImplementation(
      () =>
        ({
          originalUrl: '/',
          method: 'GET',
          params: undefined,
          query: undefined,
          body: undefined,
          headers,
        }) as unknown as Request,
    );
  return mockExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    process.env.OKTA_ISSUER = 'https://test-issuer.com';
    process.env.OKTA_AUDIENCE = 'api://default';
    process.env.CLIENT_ID = 'test-client-id';

    mockVerifyAccessToken.mockReset();
    // Default: token verification succeeds.
    mockVerifyAccessToken.mockResolvedValue({
      claims: { sub: 'a_user' },
    } as unknown as Jwt);

    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    guard = new AuthGuard(module.get(JwtService));
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow the request and set the user when the token is valid', async () => {
    const request = {
      originalUrl: '/',
      method: 'GET',
      headers: { authorization: 'Bearer good-token' },
    } as unknown as Request;
    const mockExecutionContext = createMock<ExecutionContext>();
    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockReturnValue(request);

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockVerifyAccessToken).toHaveBeenCalledWith(
      'good-token',
      'api://default',
    );
    expect((request as unknown as { user: string }).user).toBe('a_user');
  });

  it('should reject an invalid/expired token with "Token not valid"', async () => {
    mockVerifyAccessToken.mockRejectedValue(new Error('jwt expired'));
    const mockExecutionContext = contextWithHeaders({
      authorization: 'Bearer BadToken',
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      'Token not valid',
    );
  });

  it('should throw UnauthorizedException with empty Authorization header', async () => {
    const mockExecutionContext = contextWithHeaders({ authorization: '' });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      'Token not present',
    );
    expect(mockVerifyAccessToken).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException without Authorization in header', async () => {
    const mockExecutionContext = contextWithHeaders({
      authorize:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.kcPmFlSUdC9LvuMufomQepInu3GwbBKKct49e2dxyrI',
    });

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      'Token not present',
    );
    expect(mockVerifyAccessToken).not.toHaveBeenCalled();
  });
});
