const getEmailSubject = (type) => {
    switch (type) {
        case 'EMAIL_VERIFICATION':
            return 'Verifikasi Email Anda';
        case 'PASSWORD_RESET':
            return 'Reset Password';
        default:
            return 'Kode OTP Anda';
    }
};

const getVerificationEmailTemplate = (otp, expiryMinutes) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333333; margin-bottom: 10px;">Verifikasi Email Anda</h2>
                <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
                    Terima kasih telah mendaftar. Gunakan kode OTP berikut untuk memverifikasi email Anda:
                </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: #007bff; letter-spacing: 5px; margin: 0; font-size: 32px; font-weight: bold;">
                    ${otp}
                </h1>
            </div>
            
            <div style="text-align: center; color: #666666;">
                <p style="margin-bottom: 10px;">Kode ini akan kadaluarsa dalam ${expiryMinutes} menit.</p>
                <p style="font-size: 14px; color: #999999;">
                    Jika Anda tidak meminta kode ini, abaikan email ini.
                </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            </div>
        </div>
    `;
};

const getPasswordResetTemplate = (otp, expiryMinutes) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333333; margin-bottom: 10px;">Reset Password</h2>
                <p style="color: #666666; font-size: 16px; margin-bottom: 20px;">
                    Anda telah meminta untuk mereset password. Gunakan kode OTP berikut:
                </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: #dc3545; letter-spacing: 5px; margin: 0; font-size: 32px; font-weight: bold;">
                    ${otp}
                </h1>
            </div>
            
            <div style="text-align: center; color: #666666;">
                <p style="margin-bottom: 10px;">Kode ini akan kadaluarsa dalam ${expiryMinutes} menit.</p>
                <p style="font-size: 14px; color: #999999;">
                    Jika Anda tidak meminta untuk mereset password, abaikan email ini dan pastikan keamanan akun Anda.
                </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eeeeee; text-align: center; color: #999999; font-size: 12px;">
                <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
                <p>Demi keamanan, jangan bagikan kode OTP ini kepada siapapun.</p>
            </div>
        </div>
    `;
};

const getEmailTemplate = (otp, type, expiryMinutes) => {
    switch (type) {
        case 'EMAIL_VERIFICATION':
            return getVerificationEmailTemplate(otp, expiryMinutes);
        case 'PASSWORD_RESET':
            return getPasswordResetTemplate(otp, expiryMinutes);
        default:
            return getVerificationEmailTemplate(otp, expiryMinutes);
    }
};

module.exports = {
    getEmailSubject,
    getEmailTemplate
}; 