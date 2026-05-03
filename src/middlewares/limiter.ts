import { rateLimit } from 'express-rate-limit'


const isProduction = process.env.NODE_ENV === 'production';

export const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	limit: isProduction ? 200 : 10000000, // Limit each IP to 200 requests per `window` (here, per 1 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	skip: (req) => req.path === '/api/health',
	// store: ... , // Redis, Memcached, etc. See below.
})
