const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 1;
  
    return { limit, offset };
  };

  module.exports = {
    getPagination
  }