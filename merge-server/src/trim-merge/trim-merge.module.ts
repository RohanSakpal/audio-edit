import { Module } from '@nestjs/common';
import { TrimMergeService } from './trim-merge.service';
import { TrimMergeController } from './trim-merge.controller';

@Module({
  controllers: [TrimMergeController],
  providers: [TrimMergeService]
})
export class TrimMergeModule {}
