const response = (statusCode, status, data, message, res, pagination = {}) => {
    res.status(statusCode).json({
        payload: {
            status_code: statusCode,
            status: status, // "success" / "failed"
            message: message, 
            datas: data,
        },
        pagination: {
            totalItems: 100, // jumlah semua data no limit
            currentPage: 3, // page data yang lagi di buka user
            pageSize: 5, // limit / data yg ditampilkan 
            totalPages: 10, // seluruh page = seluruh data / limit
        },
    });
};

module.export = response;