const response = (statusCode, status, data, message, res, pagination = {}) => {
    // response(200, "success", ticket, "Berhasil menampilkan ticket", res)
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
            // nextOffset: 15, // data dihalaman berikutnya
            // prevOffset: 5, 
        },
  });
};

module.exports = response;
