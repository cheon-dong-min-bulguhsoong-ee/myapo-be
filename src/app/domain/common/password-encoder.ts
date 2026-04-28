export abstract class PasswordEncoder {
  abstract encode(plain: string): string;
  abstract matches(plain: string, encoded: string): boolean;
}
