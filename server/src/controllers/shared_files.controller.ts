import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharedFilesService } from '../services/shared_files.service'; // Ajusta o caminho
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('shared_files')
export class Shared_FilesController {
  constructor(private readonly sharedFilesService: SharedFilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) throw new BadRequestException('Nenhum ficheiro enviado.');
    
    try {
      return await this.sharedFilesService.registerFile(file, body);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao registar ficheiro na base de dados.');
    }
  }

  @Get('room/:roomId')
  async findAllByRoom(@Param('roomId') roomId: string) {
    const idNum = Number(roomId);
    if (isNaN(idNum)) return [];

    try {
      return await this.sharedFilesService.findAllByRoom(idNum);
    } catch (error) {
      console.error("Erro ao buscar ficheiros:", error);
      return [];
    }
  }

  @Get('download/:filename')
  download(@Param('filename') filename: string, @Res() res) {
    const path = './uploads';
    // A lógica de download permanece no controller pois envolve o objeto de resposta (@Res)
    return res.download(`${path}/${filename}`, (err) => {
      if (err) {
        res.status(404).send("Ficheiro não encontrado");
      }
    });
  }
}