import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser()); // JWT lives in an httpOnly cookie, same as before
    app.setGlobalPrefix("api"); // every route below is /api/..., matching the old Express mounting

    // In dev the Vite proxy makes everything same-origin; WEB_ORIGIN is for a split-domain prod deploy
    app.enableCors({
        origin: process.env.WEB_ORIGIN ? process.env.WEB_ORIGIN.split(",") : true,
        credentials: true
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`API running on port ${port}`);
}

bootstrap();
