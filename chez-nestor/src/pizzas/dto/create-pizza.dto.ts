import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  MinLength,
  Min,
  ArrayMinSize,
} from 'class-validator';

export class CreatePizzaDto {
  @IsString({ message: 'Le champ name doit être une chaîne de caractères' })
  @MinLength(3, { message: 'Le nom doit contenir au moins 3 caractères' })
  name: string;

  @IsNumber({}, { message: 'Le champ price doit être un nombre' })
  @Min(0.01, { message: 'Le prix doit être strictement positif' })
  price: number;

  @IsArray({ message: 'Le champ ingredients doit être un tableau' })
  @ArrayMinSize(1, { message: 'Au moins un ingrédient est requis' })
  @IsString({ each: true, message: 'Chaque ingrédient doit être une chaîne de caractères' })
  ingredients: string[];

  @IsBoolean({ message: 'Le champ available doit être un booléen' })
  available: boolean;
}
