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
              'Bearer eyJraWQiOiJNNG9CMW9DSmthdC0tYTNENFFXUFA3RWZCbUl3NG9BV05KYWJxdEJhUnM4IiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlhGdHk4Y1JqNVZaRUg4Wlo1WFhNekVlanl4R2JQa3NQS2x3RGVqV2FsNEUiLCJpc3MiOiJodHRwczovL2Rldi0xODA5MjU3OC5va3RhLmNvbS9vYXV0aDIvZGVmYXVsdCIsImF1ZCI6ImFwaTovL2RlZmF1bHQiLCJpYXQiOjE3MTI4NTg0MTUsImV4cCI6MTcxMjg2MjAxNSwiY2lkIjoiMG9hMmZxdGF6OTVmcUpxYmY1ZDciLCJ1aWQiOiIwMHUyNWh3c3AxUG04MW5jTzVkNyIsInNjcCI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiXSwiYXV0aF90aW1lIjoxNzEyODU4NDE0LCJzdWIiOiJncmVnb3J5LmFraW5zQHNlbWFudGljYml0cy5jb20ifQ.Hi8mdaKMDvKprTE0cYAAKfKGxUel3P8GqeLAvCzVUYSFSbyX2-P8CNAUm287uhYTRsi5SE0go0rvxbxRZgpDLxNOAC5h2nKcc5mYr9bdsP7nX7iW6OWqvovrDcqn0FhkGcoG9qyLO2JqyQ3OgznKTw3t3dyXAuDSnNKnXcRRxjwkxanHPiulgff9hGNOMsFINlShgNKIwcsqXi9ENsE_we_3lbUjiU9_Qkx2u21RoWNrJsF9H2byv79ZLLZO6awVyQafdpqBW_XCNBJ1e_NGuheNcwdx2HQfvLSTqr_PLEND8gRXtsJLqDPQ2Vo0WDmMBi9Kxa7HS2hDhvXOgwjpXg',
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
