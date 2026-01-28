import { Module } from '@nestjs/common';
import { CatController } from './cat.controller';
import { CatService } from './cat.service';
import { CatApiModule } from './integrations/cat-api.module';

@Module({
  imports: [CatApiModule],
  controllers: [CatController],
  providers: [CatService]
})
export class CatModule {}
