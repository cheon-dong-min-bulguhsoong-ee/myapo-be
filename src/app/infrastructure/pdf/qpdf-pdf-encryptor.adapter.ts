import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { DomainError } from '../../domain/common/error/domain.error';
import { ErrorCode } from '../../domain/common/error/error-code';
import { PdfEncryptor, PdfEncryptorInput } from '../../domain/document/contract/pdf-encryptor';

/**
 * `qpdf` CLI 를 호출해 PDF 에 user/owner 패스워드를 거는 어댑터.
 *
 * 시스템 의존성: `qpdf` (macOS: `brew install qpdf`, Debian: `apt-get install qpdf`).
 * AES-256 (`--encrypt user owner 256`) 으로 고정 — 256 미만 모드는 보안상 사용 안 함.
 *
 * qpdf 는 stdin/stdout 입출력이 빌드 옵션에 따라 제한적이라 임시 파일 두 개로 처리한다.
 * 두 임시 파일은 finally 블록에서 best-effort 로 삭제 — 컨테이너 환경에서도 누수 없게.
 */
@Injectable()
export class QpdfPdfEncryptorAdapter extends PdfEncryptor {
    private readonly logger = new Logger(QpdfPdfEncryptorAdapter.name);

    async protectWithPassword(input: PdfEncryptorInput): Promise<Buffer> {
        // owner password 는 user password 와 동일 — qpdf CLI 시그니처가 두 인자를 모두 요구하기 때문.
        // 사용자에게는 단일 비밀번호 개념만 노출.
        const password = input.userPassword;

        const requestId = randomBytes(8).toString('hex');
        const inputPath = join(tmpdir(), `myapo-pdf-in-${requestId}.pdf`);
        const outputPath = join(tmpdir(), `myapo-pdf-out-${requestId}.pdf`);

        try {
            await fs.writeFile(inputPath, input.source);
            await this.runQpdf(inputPath, outputPath, password);
            return await fs.readFile(outputPath);
        } catch (error) {
            if (error instanceof DomainError) throw error;
            this.logger.error(`qpdf encryption failed: ${this.errorMessage(error)}`);
            throw new DomainError(ErrorCode.Document.FILE_ENCRYPTION_FAILURE, {});
        } finally {
            await this.tryUnlink(inputPath);
            await this.tryUnlink(outputPath);
        }
    }

    private runQpdf(
        inputPath: string,
        outputPath: string,
        password: string,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            // `--` 가 패스워드/옵션과 입출력 경로를 분리. 패스워드는 인자로만 전달 — shell escape 문제 없음.
            // user / owner 위치에 동일한 password 사용.
            const args = [
                '--encrypt',
                password,
                password,
                '256',
                '--',
                inputPath,
                outputPath,
            ];
            const child = spawn('qpdf', args, { stdio: ['ignore', 'ignore', 'pipe'] });

            let stderr = '';
            child.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString('utf8');
            });
            child.once('error', (error) => {
                reject(new DomainError(ErrorCode.Document.FILE_ENCRYPTION_FAILURE, {
                    reason: 'spawn_failed',
                    detail: error.message,
                }));
            });
            child.once('close', (code) => {
                // qpdf exit 코드: 0 = 성공, 3 = warning (성공으로 취급), 그 외 실패.
                if (code === 0 || code === 3) {
                    resolve();
                    return;
                }
                this.logger.error(`qpdf exited with ${code}: ${stderr.trim()}`);
                reject(new DomainError(ErrorCode.Document.FILE_ENCRYPTION_FAILURE, {
                    exitCode: code,
                }));
            });
        });
    }

    private async tryUnlink(path: string): Promise<void> {
        try {
            await fs.unlink(path);
        } catch {
            // 임시 파일 삭제 실패는 무시.
        }
    }

    private errorMessage(error: unknown): string {
        if (error instanceof Error) return error.message;
        return String(error);
    }
}
