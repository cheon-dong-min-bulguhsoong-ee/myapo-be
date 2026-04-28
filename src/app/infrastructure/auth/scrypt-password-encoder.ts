import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PasswordEncoder } from '../../domain/common/contract/password-encoder';

const KEYLEN = 64;
const SALT_BYTES = 16;
const SCHEME = 'scrypt';

@Injectable()
export class ScryptPasswordEncoder extends PasswordEncoder {
  encode(plain: string): string {
    const salt = randomBytes(SALT_BYTES).toString('hex');
    const derived = scryptSync(plain, salt, KEYLEN).toString('hex');
    return `${SCHEME}$${salt}$${derived}`;
  }

  matches(plain: string, stored: string): boolean {
    const parts = stored.split('$');
    if (parts.length !== 3 || parts[0] !== SCHEME) {
      return false;
    }
    const [, salt, expectedHex] = parts;
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = scryptSync(plain, salt, expected.length);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
