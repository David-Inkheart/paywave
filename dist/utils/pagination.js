"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function paginate({ records, totalItems, page, limit }) {
    const currentPage = page || 1;
    const totalPages = Math.ceil(totalItems / limit);
    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const previousPage = currentPage > 1 ? currentPage - 1 : null;
    return {
        pagination: {
            currentPage,
            nextPage,
            previousPage,
            totalPages,
            totalItems,
        },
        records,
    };
}
exports.default = paginate;
//# sourceMappingURL=pagination.js.map