import { Controller, Get, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

// Se esta função não existir, você receberá o erro 404 ao abrir o navegador
  @Get() 
  getHello(): string {
    return 'O servidor está online!';
  }



  // ESTA É A NOVA ROTA DE UPLOAD (POST http://localhost:3000/upload)
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file')) // Intercepta o arquivo enviado pelo React
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   // Aqui você pode processar o arquivo (Blob/Stream)
  //   console.log('Arquivo recebido:', file.originalname);
  //   console.log('Tamanho:', file.size);
    
  //   return {
  //     status: 'sucesso',
  //     nome: file.originalname,
  //     tamanho: file.size,
  //   };
  // }
}