import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [],
      imports: [],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should return OK status', () => {
    expect(controller).toBeDefined();
    expect(controller.check()).toEqual({ status: 'OK' });
  });
});
