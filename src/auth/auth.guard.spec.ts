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
              sub: 'aUser@company.com',
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
              'Bearer eyJraWQiOiJNNG9CMW9DSmthdC0tYTNENFFXUFA3RWZCbUl3NG9BV05KYWJxdEJhUnM4IiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULmRQdFdGMndrYlN5VjJxVW1BanQ0dXBERklwOExMT2poRFl4MWxzYWJkaWciLCJpc3MiOiJodHRwczovL2Rldi0xODA5MjU3OC5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3MTI5MjYyNTIsImV4cCI6MTcxMjkyOTg1MiwiY2lkIjoiMG9hMmZxdGF6OTVmcUpxYmY1ZDciLCJ1aWQiOiIwMHUzaTNjM3p6WlhLcjkwMTVkNyIsInNjcCI6WyJwcm9maWxlIiwib3BlbmlkIl0sImF1dGhfdGltZSI6MTcxMjkyNjI1MSwic3ViIjoiY2VjaWxpYS5saXVAc2VtYW50aWNiaXRzLmNvbSJ9.bdZh7ygtJKvausHo58VGPLonPeWPAGXDFXHDY445ERxwCpNSiy-VdfZF3TZfg_s9k-XAwRGcd-T7lcy4dW9Qh6L74bdDucYX_TSR8WreLvS3W4o-uyRi0HQU8lB2axF2xqdB_UGEr79Am-TZhpQmwIQWXPTUpMr33fxun5ic6Tidq8WFgVVIBXTusKUHopaIP8z4gzapPo6hxLtJ6farGZcC1URHMk2o6DeyGuvO4i4y8vpowwqIHKLZ55P9kLgtbehC4LYPaRqoqWzngjF3Zy_4StmdxaFM2U_xulO5L3LysporElvVlU11HQAluXCff_PYYeV25u1Xbnp3_-W34Q',
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
