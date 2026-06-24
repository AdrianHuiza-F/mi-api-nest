import { Controller, Get, Param } from '@nestjs/common';

@Controller() // Ruta base: http://localhost:3000
export class AppController {

  @Get() // Cuando entres a la raíz
  getHello(): string {
    return '¡Hola mundo! Bienvido a tu primera API.';
  }

  @Get('saludo/:nombre') // Ruta dinámica: http://localhost:3000/saludo/TU_NOMBRE
  getPersonalizado(@Param('nombre') nombre: string): string {
    return `¡Hola ${nombre}! NestJS reconoce quién eres.`;
  }
}