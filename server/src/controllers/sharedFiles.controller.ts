import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharedFilesService } from '../services/sharedfiles.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('shared_files')
export class SharedFilesController {
  constructor(private readonly sharedFilesService: SharedFilesService) {}

  // Gere o upload de ficheiros utilizando o Multer para armazenamento local e regista os metadados no serviço
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        // Gera um nome único para o ficheiro para evitar sobreposições no servidor
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
        throw new BadRequestException('Nenhum ficheiro foi enviado.');
    }
    
    try {
      return await this.sharedFilesService.registerFile(file, body);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao registar as informações do ficheiro na base de dados.');
    }
  }

  // Lista todos os ficheiros partilhados associados a uma sala de aula específica
  @Get('room/:roomId')
  async getFilesByRoom(@Param('roomId') roomId: string) {
    const idNum = Number(roomId);
    if (isNaN(idNum)) {
        return [];
    }

    try {
      return await this.sharedFilesService.findAllByRoom(idNum);
    } catch (error) {
      console.error("Erro ao procurar ficheiros da sala:", error);
      return [];
    }
  }

  // Permite o download de um ficheiro físico através do nome guardado no servidor
  @Get('download/:filename')
  downloadFile(@Param('filename') filename: string, @Res() res) {
    const storagePath = './uploads';

    // O método download do Express envia o ficheiro diretamente para o cliente
    return res.download(`${storagePath}/${filename}`, (err) => {
      if (err) {
        console.error("Erro ao transferir ficheiro:", err);
        res.status(404).send("Ficheiro não encontrado no servidor.");
      }
    });
  }
}