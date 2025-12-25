export const AuthMiddleware = (getToken: () => string | null): Middleware =>
    req => {
        const token = getToken();
        if (token) {
            req.headers = {
                ...req.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    };