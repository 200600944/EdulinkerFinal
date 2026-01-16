import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Importação necessária
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURAÇÃO DO CORS ---
  // Mantemos a tua configuração para permitir o acesso do Frontend (Vite)
  app.enableCors({
    origin: 'http://localhost:5173', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- CONFIGURAÇÃO DO SWAGGER (OPENAPI) ---
  const config = new DocumentBuilder()
    .setTitle('EduLinker API')
    .setDescription('Documentação interativa do sistema EduLinker. Aqui podes testar as rotas de Chat, Autenticação e Ficheiros.')
    .setVersion('1.0')
    // Criamos estas "Tags" para organizar as rotas em pastas na interface
    .addTag('Auth', 'Gestão de utilizadores, login e registo')
    .addTag('Chat', 'Salas de aula e mensagens')
    .addTag('Files', 'Partilha de ficheiros')
    .build();
 
  const document = SwaggerModule.createDocument(app, config);
  
  // Define o caminho onde a documentação vai estar disponível: http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  // --- INICIALIZAÇÃO DO SERVIDOR ---
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`\n🚀 Servidor EduLinker a correr em: http://localhost:${port}`);
  console.log(`📖 Documentação (OpenAPI) em: http://localhost:${port}/api\n`);
}
bootstrap();