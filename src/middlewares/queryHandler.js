"use strict";

module.exports = (req, res, next) => {
  //filter,search, skip,limit,page,sort

  const filter = req.query?.filter || {};

  const search = req.query?.search || {};
  for (let key in search) search[key] = { $regex: search[key], $options: "i" };

  const sort = req.query?.sort || {};

  let limit = Number(req.query?.limit) ;
  limit = limit > 0 ? limit : Number(process.env.PAGE_SIZE || 12); 

 



  let page = Number(req.query?.page);
  page = page > 0 ? page : 1;

  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : (page - 1) * limit;

  res.getModelList = async (Model, customFilters = {},populate = null) => {
    return await Model.find({ ...filter, ...search, ...customFilters })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate(populate);
  };
  res.getModelListDetails = async (
    Model,
    customFilters = {}
  ) => {
    const data = await Model.find({ ...filter, ...search, ...customFilters });

    const details = {
      filter,
      customFilters,
      search,
      sort,
      limit,
      skip,
      page,
      pages:   {
        previous: page > 1 ? page -1 : false,
        current: page,
        next: page + 1,
        totalPages: Math.ceil( data?.length / limit),
      } ,
      totalRecords: data?.length,
    };


    details.pages.next = details.pages.next <= details.pages.totalPages ? details.pages.next : false 
    if(details.limit > details.totalRecords) details.pages = false;

    return details;

    // this.limit > totalRecords ?  page - 1 : false,
  };
  next();
};
