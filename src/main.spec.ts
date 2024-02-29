import { createMock } from '@golevelup/ts-jest';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
//import { configureApp } from 'app.config';
import { bootstrap } from './main';

jest.mock('@nestjs/core', () => ({
  __esModule: true,
  default: jest.fn(),
  NestFactory: {
    create: jest.fn().mockResolvedValue(createMock<NestExpressApplication>()),
  },
}));
jest.mock('./app.module');
// jest.mock('app.config');

describe('App Bootstrap', () => {
  it('it bootstraps and launches the application', async () => {
    await bootstrap();

    const factoryCreateSpy = jest.spyOn(NestFactory, 'create');

    expect(factoryCreateSpy).toHaveBeenCalled();
    //expect(configureApp).toHaveBeenCalled();
  });
});
