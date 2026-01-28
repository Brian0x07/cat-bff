import { Injectable } from '@nestjs/common';
import { CatApiService } from './integrations/cat-api.service';

@Injectable()
export class CatService {
  constructor(private readonly catApiService: CatApiService) {}

  async getImages(): Promise<CatImage[]> {
    const list = await this.catApiService.fetchCatList();
    return list.map((item: any) => ({
      id: item.id,
      url: item.url,
      width: item.width,
      height: item.height,
    }));
  }
}

export interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}
