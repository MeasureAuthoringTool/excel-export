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
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.kcPmFlSUdC9LvuMufomQepInu3GwbBKKct49e2dxyrI',
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
});
