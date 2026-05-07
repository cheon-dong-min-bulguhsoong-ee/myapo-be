import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {AppModule} from './app.module';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('MyApoBE API')
        .setDescription(`Provides an API for domains managed by the 'MyApo' backend.`)
        .setVersion('0.0.1')
        .addBearerAuth({type: 'http', scheme: 'bearer', bearerFormat: 'JWT'})
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    const port = Number(process.env.PORT ?? 4000);
    await app.listen(port);
    console.log(`[MyApoBE] listening on http://localhost:${port}/api/v1`);
    console.log(`  Swagger UI: http://localhost:${port}/docs`);
}

void bootstrap();
