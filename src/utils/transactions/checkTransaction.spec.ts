import { faker } from '@faker-js/faker';
import { mocked } from 'jest-mock';

import { storeTxnArgs, getTxnArgs } from '../../repositories/redis.txn';
import isDuplicateTxn from './checkTransaction';

jest.mock('../../repositories/redis.txn');

describe('checkTransaction', () => {
  const key = faker.string.uuid();
  const hash = faker.string.uuid();

  it('should return true if the hash is the same', async () => {
    mocked(getTxnArgs).mockResolvedValue(hash);

    const result = await isDuplicateTxn(key, hash);

    expect(result).toBe(true);
  });

  it('should return false if the hash is different', async () => {
    mocked(getTxnArgs).mockResolvedValue(faker.string.uuid());

    const result = await isDuplicateTxn(key, hash);

    expect(result).toBe(false);
  });

  it('should store the hash if it is different', async () => {
    mocked(getTxnArgs).mockResolvedValue(faker.string.uuid());

    await isDuplicateTxn(key, hash);

    expect(storeTxnArgs).toHaveBeenCalledWith(key, hash);
  });
});
