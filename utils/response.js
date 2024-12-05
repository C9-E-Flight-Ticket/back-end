const response = (statusCode, status, data, message, res, pagination = {}) => {
    // contoh response(200, "success", ticket, "Berhasil menampilkan ticket", res)
    res.status(statusCode).json({
        payload: {
            status_code: statusCode,
            status: status, // "success" / "failed"
            message: message, 
            datas: data,
        },
        pagination: {
            totalItems: pagination.totalItems || 0, // jumlah semua data no limit
            currentPage: pagination.currentPage || 1, // page data yang lagi di buka user
            pageSize: pagination.pageSize || 0, // limit / data yg ditampilkan 
            totalPages: pagination.totalPages || 1, // seluruh page = seluruh data / limit
        },
    });
};

module.exports = response;
