import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { DisputeFacade } from '../../../application/dispute/dispute.facade';
import { UserRole } from '../../../domain/user/enum/user-role.enum';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../auth/auth/roles.decorator';
import { CommonRes } from '../../common/common-res';
import { CurrentUserId } from '../../user/auth/current-user-id.decorator';
import { ChangeDisputeStatusReq } from '../req/change-dispute-status.req';
import { CreateDisputeReq } from '../req/create-dispute.req';
import { DisputeRes } from '../res/dispute.res';
import {
  AssignOperatorSwaggerApi,
  ChangeDisputeStatusSwaggerApi,
  CreateDisputeSwaggerApi,
  DisputeApiTags,
  GetDisputeSwaggerApi,
} from '../swagger/dispute.swagger.api';

@DisputeApiTags()
@Controller('api/v1/disputes')
export class DisputeController {
  constructor(private readonly disputeFacade: DisputeFacade) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @CreateDisputeSwaggerApi()
  async createDispute(
    @CurrentUserId() userId: bigint,
    @Body() req: CreateDisputeReq,
  ): Promise<CommonRes<DisputeRes>> {
    const result = await this.disputeFacade.createDispute({
      ...req,
      requesterId: userId,
    });
    return CommonRes.success(DisputeRes.from(result));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @GetDisputeSwaggerApi()
  async getDispute(
    @CurrentUserId() userId: bigint,
    @Param('id') id: string,
  ): Promise<CommonRes<DisputeRes>> {
    // 일반 유저는 본인 것만, 운영자/관리자는 전체 조회 가능 로직은 Facade/Service에서 처리
    const result = await this.disputeFacade.getDispute(id, userId);
    return CommonRes.success(DisputeRes.from(result));
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @AssignOperatorSwaggerApi()
  async assignOperator(
    @CurrentUserId() adminId: bigint,
    @Param('id') id: string,
  ): Promise<CommonRes<DisputeRes>> {
    const result = await this.disputeFacade.assignOperator(id, adminId);
    return CommonRes.success(DisputeRes.from(result));
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTITUTION) // INSTITUTION을 운영자급으로 가정하거나 별도 ROLE 필요
  @ChangeDisputeStatusSwaggerApi()
  async changeStatus(
    @CurrentUserId() operatorId: bigint,
    @Param('id') id: string,
    @Body() req: ChangeDisputeStatusReq,
  ): Promise<CommonRes<DisputeRes>> {
    const result = await this.disputeFacade.changeStatus({
      id,
      operatorId,
      newStatus: req.newStatus,
      note: req.note ?? null,
      isInternal: req.isInternal ?? false,
      credentialCode: req.credentialCode,
    });
    return CommonRes.success(DisputeRes.from(result));
  }
}
