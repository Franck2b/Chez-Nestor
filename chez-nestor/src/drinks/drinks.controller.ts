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
import { DrinksService } from './drinks.service';
import { CreateDrinkDto } from './dto/create-drink.dto';

@Controller('drinks')
export class DrinksController {
  constructor(private readonly drinksService: DrinksService) {}

  @Get()
  async findAll() {
    return this.drinksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.drinksService.findOne(id);
  }

  @Post()
  async create(@Body() createDrinkDto: CreateDrinkDto) {
    return this.drinksService.create(createDrinkDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDrinkDto: CreateDrinkDto,
  ) {
    return this.drinksService.update(id, updateDrinkDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.drinksService.remove(id);
    return { message: 'Boisson supprimée avec succès' };
  }
}
