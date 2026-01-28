import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CatService } from './cat.service';

@Controller('cat')
export class CatController {

  constructor(private readonly catService: CatService) {}

  @Get('/v1/images/search')
  async searchImages() {
    return await this.catService.getImages()
  }
}
