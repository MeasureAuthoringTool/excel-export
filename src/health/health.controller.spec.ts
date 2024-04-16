import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TerminusModule } from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  const mockedCheckServiceCall = jest.fn().mockResolvedValue(() => {
    return { status: 'ok', info: {}, error: {}, details: {} };
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: mockedCheckServiceCall,
          },
        },
      ],
      imports: [TerminusModule],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    controller.check();
    expect(mockedCheckServiceCall).toHaveBeenCalledTimes(1);
  });
});
