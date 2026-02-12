import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { DessertsService } from './desserts.service';
import { CreateDessertDto } from './dto/create-dessert.dto';

@Controller('desserts')
export class DessertsController {
  constructor(private readonly dessertsService: DessertsService) {}

  @Get()
  async findAll() {
    return this.dessertsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dessertsService.findOne(id);
  }

  @Post()
  async create(@Body() createDessertDto: CreateDessertDto) {
    return this.dessertsService.create(createDessertDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDessertDto: CreateDessertDto,
  ) {
    return this.dessertsService.update(id, updateDessertDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.dessertsService.remove(id);
    return { message: 'Dessert supprimé avec succès' };
  }
}
