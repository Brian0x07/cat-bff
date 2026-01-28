// src/integrations/cat-api.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CatApiService {
  constructor(private readonly http: HttpService) {}

  async fetchCatList() {
    const resp$ = this.http.get(`https://api.thecatapi.com/v1/images/search?limit=10`);
    const resp = await lastValueFrom(resp$);
    return resp.data;
  }
}