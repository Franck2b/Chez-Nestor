import {
  IsString,
  IsNumber,
  IsBoolean,
  MinLength,
  Min,
} from 'class-validator';

export class CreateDessertDto {
  @IsString({ message: 'Le champ name doit être une chaîne de caractères' })
  @MinLength(1, { message: 'Le nom est requis' })
  name: string;

  @IsNumber({}, { message: 'Le champ price doit être un nombre' })
  @Min(0.01, { message: 'Le prix doit être strictement positif' })
  price: number;

  @IsBoolean({ message: 'Le champ available doit être un booléen' })
  available: boolean;
}
