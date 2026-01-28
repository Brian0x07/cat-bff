import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatApiService } from './cat-api.service';

@Module({
  imports: [HttpModule],
  providers: [CatApiService],
  exports: [CatApiService],
})

export class CatApiModule {}


