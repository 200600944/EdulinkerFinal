import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shared_Files } from '../entities/shared_files.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('shared_files')
export class Shared_FilesController {
  constructor(
    @InjectRepository(Shared_Files)
    private readonly fileRepository: Repository<Shared_Files>,
  ) { }

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
    // O segredo está aqui: converter para Number
    const newFile = this.fileRepository.create({
      room_id: Number(body.roomId),
      user_id: Number(body.userId),
      file_name: file.originalname,
      file_url: file.filename,
      file_size: Number(file.size) / 1024,
    });

    return await this.fileRepository.save(newFile);
  }

  @Get('room/:roomId')
  async findAllByRoom(@Param('roomId') roomId: string) { // Recebemos como string (padrão de URL)
    try {
      const idNum = Number(roomId);

      // Se o ID não for um número válido, retornamos vazio imediatamente
      if (isNaN(idNum)) {
        return [];
      }

      return await this.fileRepository.find({
        where: { room_id: idNum }, // Usamos o número convertido
        order: { created_at: 'DESC' },
      });
    } catch (error) {

      console.error("Erro ao buscar ficheiros no DB:", error);
      return [];
    }
  }

  @Get('download/:filename')
  download(@Param('filename') filename: string, @Res() res) {
    const path = './uploads';
    return res.download(`${path}/${filename}`, (err) => {
      if (err) {
        console.error("Erro ao fazer download:", err);
        res.status(404).send("Ficheiro não encontrado");
      }
    });
  }
}