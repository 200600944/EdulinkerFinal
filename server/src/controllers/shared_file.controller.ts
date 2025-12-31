import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shared_File } from '../entities/shared_files.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('shared_file')
export class Shared_FileController {
  constructor(
    @InjectRepository(Shared_File)
    private readonly fileRepository: Repository<Shared_File>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: '../uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    const newFile = this.fileRepository.create({
      room_id: Number(body.roomId),
      user_id: Number(body.userId),
      file_name: file.originalname,
      file_url: file.filename,
      file_size: (file.size / 1024).toFixed(2) + ' KB',
    });
    return await this.fileRepository.save(newFile);
  }

  @Get('room/:roomId')
  async findAllByRoom(@Param('roomId') roomId: number) {
    return await this.fileRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'DESC' },
    });
  }

  @Get('download/:filename')
  download(@Param('filename') filename: string, @Res() res) {
    return res.sendFile(filename, { root: '../uploads' });
  }
}