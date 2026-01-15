import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    // Valida as credenciais de acesso e devolve os dados essenciais para a sessão do utilizador
    async validateUser(email: string, pass: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['role']
        });

        // Verifica se o utilizador existe e se a password coincide
        if (!user || user.password !== pass) {
            throw new UnauthorizedException('Dados Inválidos!');
        }

        return {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role?.name
        };
    }

    // Processa o registo de novos utilizadores garantindo que o email é único no sistema
    async register(createDto: CreateUserDto) {
        const userExists = await this.userRepository.findOne({ where: { email: createDto.email } });
        
        if (userExists) {
            throw new BadRequestException('Este email já está registado.');
        }

        const newUser = this.userRepository.create(createDto);

        // Atribui a role correspondente convertendo o ID para o formato numérico esperado
        if (createDto.role_id) {
            newUser.role = { id: Number(createDto.role_id) } as Role;
        }

        return await this.userRepository.save(newUser);
    }

    // Obtém a lista completa de perfis (roles) disponíveis para atribuição
    async findAllRoles() {
        return await this.roleRepository.find();
    }

    // Lista todos os utilizadores carregando simultaneamente os dados do seu perfil associado
    async findAllUsers() {
        return await this.userRepository.find({ 
            relations: ['role'] 
        });
    }
}