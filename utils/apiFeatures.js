class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;

        this.queryStr = queryStr;
    }

    filter() {
        // eslint-disable-next-line node/no-unsupported-features/es-syntax
        const queryObj = { ...this.queryStr };

        const exculdeFields = ['sort', 'limit', 'page', 'fields'];

        exculdeFields.forEach(el => delete queryObj[el]);

        let querystr = JSON.stringify(queryObj);

        querystr = querystr.replace(/\b(lte|gte|lt|gt)\b/g, m => `$${m}`);

        this.query.find(JSON.parse(querystr));

        return this;
    }

    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }

    limit() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            // console.log(fields);
            this.query.select(fields);
        } else {
            this.query.select('name price difficulty summary description');
        }
        return this;
    }

    pagination() {
        const limit = this.queryStr.limit * 1 || 10;
        const page = this.queryStr.page * 1 || 1;
        const skip = (page - 1) * limit;
        // if (skip >= docsCount) return new Error('Page doesnot exist');
        this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
