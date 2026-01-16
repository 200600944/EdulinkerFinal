import { Controller, Post, Get, Body, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
// Importamos os decorators do Swagger
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth') // Vincula este controlador à tag 'Auth' definida no main.ts
@Controller('auth')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('login')
    @ApiOperation({ 
        summary: 'Autenticar utilizador', 
        description: 'Verifica as credenciais (email e password) e devolve os dados do utilizador caso coincidam.' 
    })
    @ApiBody({ 
        schema: { 
            type: 'object', 
            properties: { 
                email: { type: 'string', example: 'professor@edulinker.com' }, 
                password: { type: 'string', example: '123456' } 
            } 
        } 
    })
    @ApiResponse({ status: 200, description: 'Autenticação bem-sucedida.' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
    async login(@Body() body: any) {
        const userData = await this.userService.validateUser(body.email, body.password);
        
        return {
            message: 'Bem-vindo!',
            user: userData
        };
    }

    @Post('register')
    @ApiOperation({ 
        summary: 'Registar novo utilizador', 
        description: 'Cria um novo perfil de utilizador na base de dados.' 
    })
    @ApiResponse({ status: 201, description: 'Utilizador criado com sucesso!' })
    @ApiResponse({ status: 400, description: 'Dados inválidos ou email já em uso.' })
    async register(@Body() createDto: CreateUserDto) {
        try {
            await this.userService.register(createDto);
            return { message: 'Utilizador criado com sucesso!' };
        } catch (error) {
            throw error;
        }
    }

    @Get('roles')
    @ApiOperation({ 
        summary: 'Listar cargos (Roles)', 
        description: 'Retorna todos os tipos de acesso disponíveis (ex: Professor, Aluno).' 
    })
    @ApiResponse({ status: 200, description: 'Lista de cargos retornada.' })
    async getRoles() {
        try {
            return await this.userService.findAllRoles();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao procurar perfis de utilizador.");
        }
    }

    @Get('users')
    @ApiOperation({ 
        summary: 'Listar todos os utilizadores', 
        description: 'Retorna a lista completa de utilizadores registados e os seus respetivos cargos.' 
    })
    @ApiResponse({ status: 200, description: 'Lista de utilizadores retornada.' })
    async getUsers() {
        try {
            return await this.userService.findAllUsers();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao procurar a lista de utilizadores.");
        }
    }
}