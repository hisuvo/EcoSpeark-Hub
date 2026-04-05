class QueryBuilder {
    query;
    args = { where: {} };
    constructor(query) {
        this.query = query;
    }
    search(searchableFields) {
        const searchTerm = this.query.searchTerm;
        if (searchTerm) {
            this.args.where.OR = searchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: 'insensitive' },
            }));
        }
        return this;
    }
    filter() {
        const queryObj = { ...this.query };
        const excludeFields = ['searchTerm', 'sortBy', 'sortOrder', 'limit', 'page', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);
        const andConditions = [];
        // Auto map remaining query objects 
        if (Object.keys(queryObj).length > 0) {
            for (const [key, value] of Object.entries(queryObj)) {
                if (value !== undefined && value !== '') {
                    // Handle boolean casts
                    if (value === 'true' || value === 'false') {
                        andConditions.push({ [key]: value === 'true' });
                    }
                    else {
                        andConditions.push({ [key]: value });
                    }
                }
            }
        }
        if (andConditions.length > 0) {
            this.args.where.AND = this.args.where.AND ? [...this.args.where.AND, ...andConditions] : andConditions;
        }
        return this;
    }
    sort() {
        let sortBy = 'createdAt';
        let sortOrder = 'desc';
        if (this.query.sortBy)
            sortBy = this.query.sortBy;
        if (this.query.sortOrder)
            sortOrder = this.query.sortOrder;
        this.args.orderBy = {
            [sortBy]: sortOrder,
        };
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.args.skip = skip;
        this.args.take = limit;
        return this;
    }
    getArgs() {
        if (Object.keys(this.args.where).length === 0) {
            delete this.args.where;
        }
        return this.args;
    }
}
export default QueryBuilder;
