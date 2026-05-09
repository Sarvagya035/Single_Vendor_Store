const DEFAULT_FRONTEND_ORIGIN = "http://localhost:4200";

const normalizeOrigin = (origin) => String(origin || "").trim().replace(/\/$/, "");

const getFrontendOrigin = () => {
    const configuredOrigin = normalizeOrigin(process.env.FRONTEND_URL || DEFAULT_FRONTEND_ORIGIN);
    return configuredOrigin || DEFAULT_FRONTEND_ORIGIN;
};

const getAllowedOrigins = () => new Set([getFrontendOrigin()]);

const createOriginChecker = () => {
    const allowedOrigins = getAllowedOrigins();

    return (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.has(normalizedOrigin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
    };
};

export {
    createOriginChecker,
    getAllowedOrigins,
    getFrontendOrigin,
    normalizeOrigin
};
