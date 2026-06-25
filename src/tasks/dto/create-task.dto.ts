import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'Revisar documentación', description: 'Título de la tarea' })
  @IsString()
  @IsNotEmpty()
  title: string;
}
