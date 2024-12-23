const response = (statusCode, status, data, message, res, pagination = null) => {
  const responsePayload = {
    payload: {
      status_code: statusCode,
      status: status,
      message: message,
      data: data,
    }
  };

  if (pagination && Object.keys(pagination).length > 0) {
    responsePayload.pagination = {
      totalItems: pagination.totalItems || 0,
      currentPage: pagination.currentPage || 1,
      pageSize: pagination.pageSize || 0,
      totalPages: pagination.totalPages || 1,
    };
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = response;