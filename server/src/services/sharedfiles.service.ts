import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shared_Files } from '../entities/shared_files.entity';

@Injectable()
export class SharedFilesService {
  constructor(
    @InjectRepository(Shared_Files)
    private readonly fileRepository: Repository<Shared_Files>,
  ) {}

  // Cria o registo dos metadados do ficheiro na base de dados após o upload físico
  async registerFile(file: Express.Multer.File, body: any) {
    const newFile = this.fileRepository.create({
      room_id: Number(body.roomId),
      user_id: Number(body.userId),
      file_name: file.originalname,
      file_url: file.filename,
      file_size: Number(file.size) / 1024, // Converte o tamanho de bytes para KB
    });

    return await this.fileRepository.save(newFile);
  }

  // Procura e devolve todos os ficheiros partilhados associados a uma sala específica
  async findAllByRoom(roomId: number) {
    return await this.fileRepository.find({
      where: { room_id: roomId },
      order: { created_at: 'DESC' },
    });
  }
}