// Turns query-string params like:
//   /api/products?category=power&brand=Anker,Oraimo&minPrice=1000&maxPrice=9000&sort=price-asc&page=2
// into a chained Mongoose query. Mirrors the filters the storefront's
// category pages need (price range + brand) plus search and sorting.
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "search", "includeAll"];
    excludedFields.forEach((field) => delete queryObj[field]);

    if (queryObj.brand) {
      queryObj.brand = { $in: queryObj.brand.split(",") };
    }

    if (queryObj.tags) {
      queryObj.tags = { $in: queryObj.tags.split(",") };
    }

    if (queryObj.minPrice || queryObj.maxPrice) {
      queryObj.price = {};
      if (queryObj.minPrice) queryObj.price.$gte = Number(queryObj.minPrice);
      if (queryObj.maxPrice) queryObj.price.$lte = Number(queryObj.maxPrice);
      delete queryObj.minPrice;
      delete queryObj.maxPrice;
    }

    if (queryObj.inStock !== undefined) {
      queryObj.inStock = queryObj.inStock === "true";
    }

    this.query = this.query.find(queryObj);
    return this;
  }

  search() {
    if (this.queryString.search) {
      this.query = this.query.find({ $text: { $search: this.queryString.search } });
    }
    return this;
  }

  sort() {
    const sortMap = {
      "price-asc": "price",
      "price-desc": "-price",
      newest: "-createdAt",
      rating: "-rating -reviewCount",
    };

    if (this.queryString.sort) {
      const sortBy = sortMap[this.queryString.sort] || this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  async paginate() {
    const page = Math.max(Number(this.queryString.page) || 1, 1);
    const limit = Math.min(Number(this.queryString.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const total = await this.query.model.countDocuments(this.query.getFilter());

    this.query = this.query.skip(skip).limit(limit);
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
    return this;
  }
}

module.exports = APIFeatures;