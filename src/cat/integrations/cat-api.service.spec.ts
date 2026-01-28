import { Test, TestingModule } from '@nestjs/testing';
import { CatApiService } from './cat-api.service';
import { HttpModule } from '@nestjs/axios';

describe('CatApiService (network)', () => {
  let service: CatApiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [CatApiService],
    }).compile();

    service = module.get<CatApiService>(CatApiService);
  });

  /**
   * 真实向 thecatapi 发起请求，请求可能较慢，给较长的超时时间
   * 运行时会把结果打印到控制台，便于你查看返回内容
   */
  it(
    'fetchCatList 应从网络获取数据并打印（真实请求）',
    async () => {
      const res = await service.fetchCatList();
      console.log('fetchCatList 返回数量:', Array.isArray(res) ? res.length : typeof res);
      console.log('fetchCatList 第一项:', res && res[0]);
      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBeGreaterThan(0);
    },
    20000,
  );
});



