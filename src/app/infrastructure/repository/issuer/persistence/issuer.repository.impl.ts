import {Injectable} from '@nestjs/common';
import {Issuer as IssuerRow} from '@prisma/client';
import {Issuer} from '../../../../domain/issuer/entity/issuer.entity';
import {IssuerCode} from '../../../../domain/issuer/enum/issuer-code.enum';
import {IssuerRepository} from '../../../../domain/issuer/repository/issuer.repository';
import {PrismaService} from '../../../prisma/prisma.service';

@Injectable()
export class IssuerRepositoryImpl extends IssuerRepository {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async findByCode(code: IssuerCode): Promise<Issuer | null> {
        const row = await this.prisma.issuer.findFirst({
            where: {code, isDelete: false},
        });
        return row === null ? null : this.toEntity(row);
    }

    async findByAdminId(adminId: string): Promise<Issuer | null> {
        const row = await this.prisma.issuer.findFirst({
            where: {adminId, isDelete: false},
        });
        return row === null ? null : this.toEntity(row);
    }

    async create(input: {
        code: IssuerCode;
        name: string;
        walletAddress: string;
        adminId: string;
        passwordHash: string;
    }): Promise<Issuer> {
        const row = await this.prisma.issuer.create({
            data: {
                code: input.code,
                name: input.name,
                walletAddress: input.walletAddress,
                adminId: input.adminId,
                passwordHash: input.passwordHash,
            },
        });
        return this.toEntity(row);
    }

    private toEntity(row: IssuerRow): Issuer {
        return new Issuer(
            row.code as IssuerCode,
            row.name,
            row.walletAddress,
            row.adminId,
            row.passwordHash,
            row.status,
            row.createdAt,
            row.updatedAt,
        );
    }
}
