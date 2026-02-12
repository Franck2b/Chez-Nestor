import {
  IsArray,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsArray({ message: 'Le champ pizzas doit être un tableau' })
  @IsNumber({}, { each: true, message: 'Chaque pizza doit être un nombre' })
  pizzas?: number[];

  @IsOptional()
  @IsArray({ message: 'Le champ drinks doit être un tableau' })
  @IsNumber({}, { each: true, message: 'Chaque boisson doit être un nombre' })
  drinks?: number[];

  @IsOptional()
  @IsArray({ message: 'Le champ desserts doit être un tableau' })
  @IsNumber({}, { each: true, message: 'Chaque dessert doit être un nombre' })
  desserts?: number[];
}
