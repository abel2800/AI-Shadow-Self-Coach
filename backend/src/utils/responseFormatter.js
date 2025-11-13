/**
 * Response Formatter
 * Standardizes API responses
 */

/**
 * Format success response
 */
function successResponse(data, message = null, meta = {}) {
  const response = {
    success: true,
    data,
    ...(message && { message }),
    ...(Object.keys(meta).length > 0 && { meta })
  };

  return response;
}

/**
 * Format paginated response
 */
function paginatedResponse(data, page, perPage, total) {
  return {
    success: true,
    data,
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage)
    }
  };
}

/**
 * Format error response
 */
function errorResponse(code, message, details = null, requestId = null) {
  const response = {
    success: false,
    error: {
      code,
      message
    },
    ...(details && { details }),
    ...(requestId && { request_id: requestId })
  };

  return response;
}

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse
};

