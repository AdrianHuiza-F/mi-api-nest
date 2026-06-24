async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ¡Esto es vital! Permite que el Frontend se conecte
  app.enableCors();

  // Activamos la validación de datos que vimos antes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3000);
}
bootstrap();