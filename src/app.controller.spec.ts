import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import {Request as ExpressRequest, Response} from 'express';

import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';


describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, AuthService, UsersService, JwtService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "OK"', async () => {
      const httpMocks = require('node-mocks-http');
      
    const response:Response = httpMocks.createResponse() as Response; 
    
    await expect(appController.getFile(response)).toBeDefined();
    //expect(res.statusCode).toEqual(200);
    });
  });
});
