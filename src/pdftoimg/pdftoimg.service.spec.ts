import { Test, TestingModule } from '@nestjs/testing';
import { PdftoimgService } from './pdftoimg.service';

describe('PdftoimgService', () => {
  let service: PdftoimgService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdftoimgService],
    }).compile();

    service = module.get<PdftoimgService>(PdftoimgService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
