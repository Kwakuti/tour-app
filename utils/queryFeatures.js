
class QueryFeatures {
    constructor (model, requestQuery, filters) {
        this.query = model.find(filters);
        this.requestQuery = requestQuery;
    }

    filterQueries() {
        const queryObject =  {...this.requestQuery};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObject[field]);

        let stringedQuery = JSON.stringify(queryObject);

        stringedQuery = JSON.parse(stringedQuery.replace(/\b(gte|gt|lte|lt)\b/g, matchedString => `$${matchedString}`));

        this.query = this.query.find(stringedQuery);
        return this;
    }

     sort() {
        if(this.requestQuery.sort) {
            let sortCriteria = this.requestQuery.sort.split(',').join(' ');
            this.query = this.query.sort(sortCriteria);
        } else {
            this.query = this.query.sort('-createdAt');
        }        
          return this;
    }

    fields() {        
        if(this.requestQuery.fields) {
            let selectedFields = this.requestQuery.fields.split(',').join(' ');
            this.query = this.query.select(`${selectedFields}`);
        } else {
            this.query = this.query.select('name duration difficulty');
        }
        return this;
    }

    paginate() {
        let page = this.requestQuery.page * 1 || 1;
        let limit = this.requestQuery.limit * 1 || 4;
    
        let skip = (page - 1) * limit; 
        this.query = this.query.skip(skip).limit(limit);
  
        return this;
    }
}

module.exports = QueryFeatures;
