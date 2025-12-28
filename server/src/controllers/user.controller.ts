import { Controller, Post, Get, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('auth')
export class UserController {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
    ) { }

    //Login
    @Post('login')
    async login(@Body() body: any) {
        const { email, password } = body;

        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['role'] // como sabemos se é admin
        });

        if (!user || user.password !== password) {
            throw new UnauthorizedException('Dados Inválidos!');
        }

        return {
            message: 'Bem-vindo!',
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role?.name // Retorna o nome da role para o frontend validar o isAdmin()
            }
        };
    }

    //Registo
    @Post('register')
    async register(@Body() createDto: CreateUserDto) {
        // 1. Verificar se o email já existe
        const userExists = await this.userRepository.findOne({ where: { email: createDto.email } });
        if (userExists) {
            throw new BadRequestException('Este email já está registado.');
        }

        // 2. Criar a instância do utilizador (mapeia nome, email, password)
        const newUser = this.userRepository.create(createDto);

        // 3. Atribuir a Role manualmente para garantir a gravação da FK
        // Usamos 'createDto' que é o nome correto da variável no teu código
        if (createDto.role_id) {
            // Atribuímos um objeto parcial com o ID à relação 'role'
            // Isso força o TypeORM a gravar o valor na coluna role_id do MySQL
            newUser.role = { id: Number(createDto.role_id) } as Role;
        }

        // 4. Gravar no MySQL
        await this.userRepository.save(newUser);

        return { message: 'Utilizador criado com sucesso!' };
    }
    
    //Perfis
    @Get('roles') // Isto cria a rota http://localhost:3000/auth/roles (se o prefixo for auth)
    async getRoles() {
        // Vamos buscar todas as roles diretamente do repositório
        return await this.roleRepository.find();
    }
}