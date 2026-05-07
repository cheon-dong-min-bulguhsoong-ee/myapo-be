import { UserWallet } from './user-wallet.entity';
import { VerifierType } from '../enum/verifier-type.enum';

describe('UserWallet Entity', () => {
  const mockWalletArgs = {
    id: BigInt(1),
    userId: BigInt(1),
    verifier: VerifierType.GOOGLE,
    verifierId: 'sub-123',
    xrplAddress: 'rHb9CJA',
    publicKey: '03ED',
    requestedAt: new Date(),
    activatedAt: new Date(),
    updatedAt: new Date(),
  };

  it('유저 지갑 엔티티를 생성할 수 있다', () => {
    const wallet = new UserWallet(
      mockWalletArgs.id,
      mockWalletArgs.userId,
      mockWalletArgs.verifier,
      mockWalletArgs.verifierId,
      mockWalletArgs.xrplAddress,
      mockWalletArgs.publicKey,
      mockWalletArgs.requestedAt,
      mockWalletArgs.activatedAt,
      mockWalletArgs.updatedAt,
    );
    expect(wallet.xrplAddress).toBe('rHb9CJA');
  });

  it('verifySignature()는 항상 true를 반환한다 (MVP 기준)', () => {
    const wallet = new UserWallet(
      mockWalletArgs.id,
      mockWalletArgs.userId,
      mockWalletArgs.verifier,
      mockWalletArgs.verifierId,
      mockWalletArgs.xrplAddress,
      mockWalletArgs.publicKey,
      mockWalletArgs.requestedAt,
      mockWalletArgs.activatedAt,
      mockWalletArgs.updatedAt,
    );
    expect(wallet.verifySignature('msg', 'sig')).toBe(true);
  });
});
