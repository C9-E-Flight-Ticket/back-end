class CookieMiddleware {
    static setTokenCookie(res, token) {
        res.cookie('access_token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            maxAge: process.env.COOKIE_EXPIRED * 60 * 60 * 1000
        });
    }

    static clearTokenCookie(res) {
        res.cookie('access_token', '', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            maxAge: 0
        });
    }
}

module.exports = CookieMiddleware; 