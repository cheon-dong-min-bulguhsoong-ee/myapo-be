import { applyDecorators } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonRes } from '../../common/api-common-res.decorator';
import { CreateDocumentRes } from '../res/create-document.res';

/**
 * 컨트롤러 비즈니스 데코레이터를 한 곳에 모아서 컨트롤러 본문을 얇게 유지한다.
 * 새 엔드포인트가 생기면 여기에 X<XSwaggerApi>() 형태로 추가.
 */

export const DocumentApiTags = (): ClassDecorator => ApiTags('Documents');

export const CreateDocumentSwaggerApi = (): MethodDecorator =>
  applyDecorators(
    ApiOperation({
      summary: '문서 발급 신청 (Document 생성 + 5단계 파이프라인 시작)',
      description:
        '사용자가 문서 카탈로그에서 한 종류를 선택해 발급을 신청한다. ' +
        '한 트랜잭션으로 Document(status=PROGRESS, currentStage=AUTHORITY_ISSUED) 행과 ' +
        '첫 DocumentStage 이벤트(stage=AUTHORITY_ISSUED, status=PENDING) 가 함께 INSERT 된다. ' +
        '이후 단계는 별도 워커가 순차적으로 처리한다.\n\n' +
        '*임시 인증*: 현재는 `X-User-Id` 헤더로 사용자를 식별한다. ' +
        '로그인/JWT 가드 도입 시 헤더 대신 인증 토큰에서 추출되도록 교체될 예정.',
    }),
    ApiHeader({
      name: 'X-User-Id',
      description:
        '사용자 ID (임시 인증). JWT 가드 도입 시 제거 예정. ' +
        '시드 SQL 의 기본 사용자는 id=1.',
      required: true,
      example: '1',
    }),
    ApiCommonRes(CreateDocumentRes),
  );
