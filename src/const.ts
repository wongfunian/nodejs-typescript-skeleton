export const USER_TOKEN = {
    staff: 'pip_staff_token',
    client: 'pip_client_token',
    agent: 'pip_agent_token',
};

export const DOMAIN = '-';
export const PLATFORM_NAME = 'Propagate Intellectual Property';
export const FRONTEND_URL =
    process.env.NODE_ENV === 'production'
        ? {
              api: 'https://api.raymondtour.com',
              staff: 'https://staff.raymondtour.com',
              client: 'https://rt.raymondtour.com',
              agent: '',
          }
        : {
              api: 'http://localhost:4000',
              staff: 'http://localhost:3000',
              client: 'http://localhost:3001',
              agent: 'http://localhost:3002',
          };

export const COOKIE_DOMAIN = process.env.NODE_ENV === 'production' ? `.${DOMAIN}` : 'localhost';

export const COOKIE_OPTIONS = {
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
    domain: COOKIE_DOMAIN,
};

export const IMAGE_QUALITY_REDUCED_BY_PERCENTAGE = 50;
