import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { DeleteTestnetCredentialReq } from '../req/delete-testnet-credential.req';
import { CreateCredentialIssueRequestRes, CredentialIssueRequestRes } from '../res/credential-issue-request.res';
import { CredentialDetailRes, ListCredentialsRes } from '../res/credential.res';
import { ListCredentialSubmissionsRes, SubmitCredentialRes } from '../res/credential-submission.res';
import { XrplCredentialEvidenceRes } from '../res/xrpl-credential-evidence.res';

export const CredentialApiTags = (): ClassDecorator => ApiTags('Credentials');

const withBearer = <T extends MethodDecorator>(decorator: T): MethodDecorator =>
  applyDecorators(ApiBearerAuth(), decorator);

export const CreateCredentialIssueRequestSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: '크리덴셜 발급 요청 생성', description: 'Internal JWT 기반 사용자 발급 요청을 생성하고 XRP Testnet evidence 또는 MVP fallback Credential을 발급합니다.' }),
      ApiCommonRes(CreateCredentialIssueRequestRes),
    ),
  );

export const GetCredentialIssueRequestSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(ApiOperation({ summary: '크리덴셜 발급 요청 조회' }), ApiCommonRes(CredentialIssueRequestRes)));

export const ListCredentialsSwaggerApi = (): MethodDecorator =>
  withBearer(
    applyDecorators(
      ApiOperation({ summary: '내 크리덴셜 목록 조회' }),
      ApiQuery({ name: 'status', required: false }),
      ApiCommonRes(ListCredentialsRes),
    ),
  );

export const GetCredentialDetailSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(ApiOperation({ summary: '내 크리덴셜 상세 조회' }), ApiCommonRes(CredentialDetailRes)));

export const SubmitCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(ApiOperation({ summary: '기관 요청에 크리덴셜 제출' }), ApiCommonRes(SubmitCredentialRes)));

export const ListCredentialSubmissionsSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(ApiOperation({ summary: '내 크리덴셜 제출 이력 조회' }), ApiCommonRes(ListCredentialSubmissionsRes)));

export const AcceptTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(ApiOperation({ summary: 'XRP Testnet CredentialAccept 실행' }), ApiCommonRes(XrplCredentialEvidenceRes)));

export const DeleteTestnetCredentialSwaggerApi = (): MethodDecorator =>
  withBearer(applyDecorators(
    ApiOperation({ summary: 'XRP Testnet CredentialDelete 실행' }),
    ApiBody({ type: DeleteTestnetCredentialReq }),
    ApiCommonRes(XrplCredentialEvidenceRes),
  ));
