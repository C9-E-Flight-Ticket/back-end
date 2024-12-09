const session = require('express-session');
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
        const cookieOptions = {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            maxAge: 0
        };

        res.cookie('access_token', '', cookieOptions);
        res.cookie('connect.sid', '', cookieOptions);
    }

    static oauthSession = session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: false,
            maxAge: process.env.COOKIE_EXPIRED * 60 * 60 * 1000
        }
    });
}

module.exports = CookieMiddleware; 