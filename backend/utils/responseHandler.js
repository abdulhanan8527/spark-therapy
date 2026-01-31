/**
 * Success response handler
 * @param {Object} res - Express response object
 * @param {any} data - Data to send in response
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Error response handler
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {any} error - Error details (optional)
 */
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper
 * @param {Array} data - Array of data
 * @param {number} page - Current page (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @returns {Object} Paginated data
 */
const paginate = (data, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const result = {};
  
  if (endIndex < data.length) {
    result.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    result.previous = {
      page: page - 1,
      limit
    };
  }
  
  result.results = data.slice(startIndex, endIndex);
  result.total = data.length;
  result.page = page;
  result.limit = limit;
  
  return result;
};

/**
 * Paginated response handler
 * @param {Object} res - Express response object
 * @param {Array} data - Data array to paginate
 * @param {Object} paginationOptions - Pagination options { page, limit }
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, paginationOptions = {}, message = 'Success') => {
  const { page = 1, limit = 10 } = paginationOptions;
  const paginatedData = paginate(data, parseInt(page), parseInt(limit));
  
  return res.status(200).json({
    success: true,
    message,
    data: paginatedData.results,
    pagination: {
      currentPage: paginatedData.page,
      totalPages: Math.ceil(paginatedData.total / paginatedData.limit),
      totalItems: paginatedData.total,
      itemsPerPage: paginatedData.limit,
      hasNext: !!paginatedData.next,
      hasPrevious: !!paginatedData.previous
    }
  });
};

/**
 * Cached response handler
 * @param {Object} res - Express response object
 * @param {any} data - Data to send
 * @param {string} cacheKey - Cache key for identification
 * @param {number} ttl - Time to live in seconds
 * @param {string} message - Success message
 */
const cachedResponse = (res, data, cacheKey, ttl = 3600, message = 'Success') => {
  res.set({
    'Cache-Control': `public, max-age=${ttl}`,
    'ETag': `"${cacheKey}-${Date.now()}"`,
    'Last-Modified': new Date().toUTCString()
  });
  
  return successResponse(res, data, message, 200);
};

/**
 * Standardized API response format
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
const apiResponse = (res, options = {}) => {
  const {
    success = true,
    message = success ? 'Operation completed successfully' : 'Operation failed',
    data = null,
    statusCode = success ? 200 : 400,
    pagination = null,
    meta = null,
    cache = null
  } = options;
  
  const response = {
    success,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  if (meta) response.meta = meta;
  
  // Set cache headers if provided
  if (cache) {
    res.set({
      'Cache-Control': `public, max-age=${cache.ttl || 3600}`,
      'ETag': `"${cache.key || 'default'}-${Date.now()}"`
    });
  }
  
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse,
  paginate,
  paginatedResponse,
  cachedResponse,
  apiResponse
};