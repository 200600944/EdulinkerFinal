import { Controller, Post, Get, Body, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('auth')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('login')
    async login(@Body() body: any) {
        // O Controller apenas chama o Service e devolve a resposta amigável
        const userData = await this.userService.validateUser(body.email, body.password);
        
        return {
            message: 'Bem-vindo!',
            user: userData
        };
    }

    @Post('register')
    async register(@Body() createDto: CreateUserDto) {
        try {
            await this.userService.register(createDto);
            return { message: 'Utilizador criado com sucesso!' };
        } catch (error) {
            // Se o erro já for uma exceção do Nest (como BadRequest), ele propaga automaticamente
            throw error;
        }
    }

    @Get('roles')
    async getRoles() {
        return await this.userService.findAllRoles();
    }

    @Get('users')
    async getUsers() {
        return await this.userService.findAllUsers();
    }
}