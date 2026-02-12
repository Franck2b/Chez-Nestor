import {
  IsString,
  IsNumber,
  IsBoolean,
  MinLength,
  Min,
} from 'class-validator';

export class CreateDrinkDto {
  @IsString({ message: 'Le champ name doit être une chaîne de caractères' })
  @MinLength(1, { message: 'Le nom est requis' })
  name: string;

  @IsNumber({}, { message: 'Le champ price doit être un nombre' })
  @Min(0.01, { message: 'Le prix doit être strictement positif' })
  price: number;

  @IsString({ message: 'Le champ size doit être une chaîne de caractères' })
  size: string;

  @IsBoolean({ message: 'Le champ withAlcohol doit être un booléen' })
  withAlcohol: boolean;

  @IsBoolean({ message: 'Le champ available doit être un booléen' })
  available: boolean;
}
