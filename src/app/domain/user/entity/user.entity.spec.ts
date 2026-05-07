import { User } from './user.entity';
import { DomainError } from '../../common/error/domain.error';

describe('User Entity', () => {
  const mockUserArgs = {
    id: BigInt(1),
    email: 'test@example.com',
    name: 'Test User',
    nationality: 'KR',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDelete: false,
  };

  it('올바른 국적 코드(KR)로 유저를 생성할 수 있다', () => {
    const user = new User(
      mockUserArgs.id,
      mockUserArgs.email,
      mockUserArgs.name,
      mockUserArgs.nationality,
      mockUserArgs.createdAt,
      mockUserArgs.updatedAt,
      mockUserArgs.isDelete,
    );
    expect(user.nationality).toBe('KR');
  });

  it('올바르지 않은 국적 코드(ABC)로 생성 시 DomainError를 던진다', () => {
    expect(() => {
      new User(
        mockUserArgs.id,
        mockUserArgs.email,
        mockUserArgs.name,
        'ABC',
        mockUserArgs.createdAt,
        mockUserArgs.updatedAt,
        mockUserArgs.isDelete,
      );
    }).toThrow(DomainError);
  });

  it('markAsDeleted() 호출 시 isDelete가 true가 된다', () => {
    const user = new User(
      mockUserArgs.id,
      mockUserArgs.email,
      mockUserArgs.name,
      mockUserArgs.nationality,
      mockUserArgs.createdAt,
      mockUserArgs.updatedAt,
      false,
    );
    user.markAsDeleted();
    expect(user.isDelete).toBe(true);
  });

  it('reactivate() 호출 시 isDelete가 false가 된다', () => {
    const user = new User(
      mockUserArgs.id,
      mockUserArgs.email,
      mockUserArgs.name,
      mockUserArgs.nationality,
      mockUserArgs.createdAt,
      mockUserArgs.updatedAt,
      true,
    );
    user.reactivate();
    expect(user.isDelete).toBe(false);
  });
});
