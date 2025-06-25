class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const objQuery = { ...this.queryString };
    const excludedField = ['sort', 'page', 'limit', 'fields'];
    excludedField.forEach((ele) => delete objQuery[ele]);

    if (objQuery.author) {
      objQuery['author.name'] = objQuery.author;
      delete objQuery.author;
    }

    if (objQuery.available) {
      objQuery.availability = objQuery.available === 'true';
      delete objQuery.available;
    }

    let querystring = JSON.stringify(objQuery);
    querystring = querystring.replace(
      /\b(gte|lt|lte|gt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(querystring));
    return this;
  }

  sorting() {
    if (this.queryString === 'sort') {
      const sortBy = this.queryString.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-creadtedAt -_id');
    }
    return this;
  }
  fields() {
    if (this.queryString === 'fields') {
      const field = this.queryString.split(',').join(' ');
      this.query = this.query.select(field);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeature;
