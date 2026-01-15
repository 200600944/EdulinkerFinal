import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shared_Files } from '../entities/shared_files.entity';

@Injectable()
export class SharedFilesService {
  constructor(
    @InjectRepository(Shared_Files)
    private readonly fileRepository: Repository<Shared_Files>,
  ) {}

  // Regista as informações do ficheiro na base de dados
  async registerFile(file: Express.Multer.File, body: any) {
    const newFile = this.fileRepository.create({
      room_id: Number(body.roomId),
      user_id: Number(body.userId),
      file_name: file.originalname,
      file_url: file.filename,
      file_size: Number(file.size) / 1024,
    });

    return await this.fileRepository.save(newFile);
  }

  // Procura todos os ficheiros ativos de uma sala específica
  async findAllByRoom(roomId: number) {
    return await this.fileRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'DESC' },
    });
  }
}