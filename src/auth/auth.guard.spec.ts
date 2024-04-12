import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService],
    }).compile();

    guard = new AuthGuard(module.get(JwtService));
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should have a fully mocked Execution Context with good auth token', async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();

    mockExecutionContext.switchToHttp = jest.fn().mockResolvedValue({
      getRequest: () => ({
        originalUrl: '/',
        method: 'GET',
        params: undefined,
        query: undefined,
        body: undefined,
        headers: '',
      }),
      getResponse: () => ({
        statusCode: 200,
      }),
    });

    jest.mock('@okta/jwt-verifier', () => {
      return jest.fn().mockImplementation(() => ({
        verifyAccessToken: () => ({
          oktaToken: {
            claims: {
              sub: 'a_user@acompany.com',
            },
          },
        }),
      }));
    });

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockImplementation(() => {
        return {
          originalUrl: '/',
          method: 'GET',
          params: undefined,
          query: undefined,
          body: undefined,
          headers: {
            authorization:
              'Bearer eyJraWQiOiJNNG9CMW9DSmthdC0tYTNENFFXUFA3RWZCbUl3NG9BV05KYWJxdEJhUnM4IiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULl8xc1BEY0hpekhSdm5CSlZsaWQzak5tVXZjMDIzU3FCZDB0UUhnVldkT0EiLCJpc3MiOiJodHRwczovL2Rldi0xODA5MjU3OC5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3MTI5MzcwNjQsImV4cCI6MTcxMjk0MDY2NCwiY2lkIjoiMG9hMmZxdGF6OTVmcUpxYmY1ZDciLCJ1aWQiOiIwMHUzaTNjM3p6WlhLcjkwMTVkNyIsInNjcCI6WyJvcGVuaWQiLCJwcm9maWxlIl0sImF1dGhfdGltZSI6MTcxMjkzMjU5NSwic3ViIjoiY2VjaWxpYS5saXVAc2VtYW50aWNiaXRzLmNvbSJ9.x_vx7uCGXPyme80erURcS87ZUdibdBRKiNB58yg-AcNoF0ZYoro0lOr9up-ev0j32SQvBnhMXRZOARoOy4ALcT_GovwluH2v_sjXhNtjn26GV5UZU1EaWXsdMWfwg_-6eAmlQ9dLkIZerIYsu7Ut8pfwirgbpME4mMKqiJBXEkRWHUkAh5PEnJO4DvaKj6Tis5ERprNLuUKR5M4bWMhBjAMt74fTu5iLiANOi0uqropZscP72HVNEQhkyqM84hvgAvZvzlVYKUTUBuoWQF21eRSOUpYSE0yvDRW5JS5r0NCXUEZwuNfavuvl3gDUae31hcbtOo7kznQ2Q_-GkfVThA',
          },
        } as unknown as Request;
      });

    const result: boolean = await guard.canActivate(mockExecutionContext);
    expect(result).toBeTruthy();
  });

  it('should throw UnauthorizedException with bad auth token', async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();

    mockExecutionContext.switchToHttp = jest.fn().mockResolvedValue({
      getRequest: () => ({
        originalUrl: '/',
        method: 'GET',
        params: undefined,
        query: undefined,
        body: undefined,
      }),
      getResponse: () => ({
        statusCode: 200,
      }),
    });

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockImplementation(() => {
        return {
          originalUrl: '/',
          method: 'GET',
          params: undefined,
          query: undefined,
          body: undefined,
          headers: { authorization: 'Bearer BadToken' },
        } as unknown as Request;
      });

    try {
      await guard.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e.message).toBe('Token not valid');
    }
  });

  it('should throw UnauthorizedException with bad auth token', async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();

    mockExecutionContext.switchToHttp = jest.fn().mockResolvedValue({
      getRequest: () => ({
        originalUrl: '/',
        method: 'GET',
        params: undefined,
        query: undefined,
        body: undefined,
      }),
      getResponse: () => ({
        statusCode: 200,
      }),
    });

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockImplementation(() => {
        return {
          originalUrl: '/',
          method: 'GET',
          params: undefined,
          query: undefined,
          body: undefined,
          headers: { authorization: '' },
        } as unknown as Request;
      });

    try {
      await guard.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e.message).toBe('Token not present');
    }
  });

  it('should throw UnauthorizedException without Authorization in header', async () => {
    const mockExecutionContext = createMock<ExecutionContext>();
    expect(mockExecutionContext.switchToHttp()).toBeDefined();

    mockExecutionContext.switchToHttp = jest.fn().mockResolvedValue({
      getRequest: () => ({
        originalUrl: '/',
        method: 'GET',
        params: undefined,
        query: undefined,
        body: undefined,
      }),
      getResponse: () => ({
        statusCode: 200,
      }),
    });

    jest
      .spyOn(mockExecutionContext.switchToHttp(), 'getRequest')
      .mockImplementation(() => {
        return {
          originalUrl: '/',
          method: 'GET',
          params: undefined,
          query: undefined,
          body: undefined,
          headers: {
            authorize:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.kcPmFlSUdC9LvuMufomQepInu3GwbBKKct49e2dxyrI',
          },
        } as unknown as Request;
      });

    try {
      await guard.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e.message).toBe('Token not present');
    }
  });
});
