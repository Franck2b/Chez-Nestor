import { Module } from '@nestjs/common';
import { DessertsController } from './desserts.controller';
import { DessertsService } from './desserts.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [DessertsController],
  providers: [DessertsService],
  exports: [DessertsService],
})
export class DessertsModule {}
