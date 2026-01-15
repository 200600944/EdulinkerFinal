import { Controller, Post, Get, Body, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('auth')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // Autentica um utilizador verificando as credenciais e devolvendo os dados de sessão
    @Post('login')
    async login(@Body() body: any) {
        const userData = await this.userService.validateUser(body.email, body.password);
        
        return {
            message: 'Bem-vindo!',
            user: userData
        };
    }

    // Regista um novo utilizador no sistema utilizando os dados validados pelo DTO
    @Post('register')
    async register(@Body() createDto: CreateUserDto) {
        try {
            await this.userService.register(createDto);
            return { message: 'Utilizador criado com sucesso!' };
        } catch (error) {
            // Exceções de negócio (como email duplicado) são propagadas automaticamente pelo NestJS
            throw error;
        }
    }

    // Procura e devolve todos os perfis de acesso (roles) configurados na base de dados
    @Get('roles')
    async getRoles() {
        try {
            return await this.userService.findAllRoles();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao procurar perfis de utilizador.");
        }
    }

    // Lista todos os utilizadores registados, incluindo as informações dos seus respetivos perfis
    @Get('users')
    async getUsers() {
        try {
            return await this.userService.findAllUsers();
        } catch (error) {
            throw new InternalServerErrorException("Erro ao procurar a lista de utilizadores.");
        }
    }
}