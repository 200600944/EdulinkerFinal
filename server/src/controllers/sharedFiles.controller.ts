import { Controller, Post, UseInterceptors, UploadedFile, Body, Get, Param, Res, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharedFilesService } from '../services/sharedfiles.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
// Importamos os decorators do Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Files') // Vincula este controlador à tag 'Files' do main.ts
@Controller('shared_files')
export class SharedFilesController {
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
  @ApiOperation({ summary: 'Enviar um novo ficheiro', description: 'Faz o upload de um ficheiro binário e associa-o a uma sala e utilizador.' })
  @ApiConsumes('multipart/form-data') // Necessário para o Swagger habilitar o upload de ficheiros
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' }, // Define o campo de upload no Swagger
        roomId: { type: 'number', example: 1 },
        userId: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Ficheiro carregado e registado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Nenhum ficheiro enviado ou dados inválidos.' })
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

  @Get('room/:roomId')
  @ApiOperation({ summary: 'Listar ficheiros de uma sala', description: 'Retorna todos os metadados dos ficheiros partilhados numa sala específica.' })
  @ApiParam({ name: 'roomId', description: 'ID da sala de aula', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de ficheiros encontrada.' })
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

  @Get('download/:filename')
  @ApiOperation({ summary: 'Descarregar ficheiro', description: 'Faz o download do ficheiro físico a partir do nome único guardado no servidor.' })
  @ApiParam({ name: 'filename', description: 'Nome do ficheiro no disco (ex: 164...-99.pdf)' })
  @ApiResponse({ status: 200, description: 'Stream do ficheiro iniciado.' })
  @ApiResponse({ status: 404, description: 'Ficheiro não encontrado.' })
  downloadFile(@Param('filename') filename: string, @Res() res) {
    const storagePath = './uploads';

    return res.download(`${storagePath}/${filename}`, (err) => {
      if (err) {
        console.error("Erro ao transferir ficheiro:", err);
        res.status(404).send("Ficheiro não encontrado no servidor.");
      }
    });
  }
}