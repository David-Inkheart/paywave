import { faker } from '@faker-js/faker';
import paginate from './pagination';

describe('pagination', () => {
  it('should handle an empty records array correctly', () => {
    const records: any[] = [];
    const totalItems = 0;
    const page = 1;
    const limit = 5;

    const result = paginate({ records, totalItems, page, limit });

    expect(result.pagination.currentPage).toBe(page);
    expect(result.pagination.totalPages).toBe(0); // No records, so total pages should be 0
    expect(result.pagination.nextPage).toBe(null);
    expect(result.pagination.previousPage).toBe(null);
    expect(result.pagination.totalItems).toBe(totalItems);
    expect(result.records).toHaveLength(0);
  });

  it('should handle a single page correctly', () => {
    const records = [faker.person.firstName()];
    const totalItems = 1;
    const page = 1;
    const limit = 5;

    const result = paginate({ records, totalItems, page, limit });

    expect(result.pagination.currentPage).toBe(page);
    expect(result.pagination.totalPages).toBe(1);
    expect(result.pagination.nextPage).toBe(null);
    expect(result.pagination.previousPage).toBe(null);
    expect(result.pagination.totalItems).toBe(totalItems);
    expect(result.records).toHaveLength(1);
  });

  it('should handle multiple pages correctly', () => {
    const records = [faker.person.firstName(), faker.person.firstName(), faker.person.firstName()];
    const totalItems = 3;
    const page = 1;
    const limit = 2;

    const result = paginate({ records, totalItems, page, limit });

    expect(result.pagination.currentPage).toBe(page);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.nextPage).toBe(2);
    expect(result.pagination.previousPage).toBe(null);
    expect(result.pagination.totalItems).toBe(totalItems);
    expect(result.records).toHaveLength(3);
  });

  it('should handle the last page correctly', () => {
    const records = [faker.person.firstName(), faker.person.firstName(), faker.person.firstName()];
    const totalItems = 3;
    const page = 2;
    const limit = 2;

    const result = paginate({ records, totalItems, page, limit });

    expect(result.pagination.currentPage).toBe(page);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.nextPage).toBe(null);
    expect(result.pagination.previousPage).toBe(1);
    expect(result.pagination.totalItems).toBe(totalItems);
    expect(result.records).toHaveLength(3);
  });

  it('should handle a page with less records than the limit correctly', () => {
    const records = [faker.person.firstName()];
    const totalItems = 3;
    const page = 2;
    const limit = 2;

    const result = paginate({ records, totalItems, page, limit });

    expect(result.pagination.currentPage).toBe(page);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.nextPage).toBe(null);
    expect(result.pagination.previousPage).toBe(1);
    expect(result.pagination.totalItems).toBe(totalItems);
    expect(result.records).toHaveLength(1);
  });
});
