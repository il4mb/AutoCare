import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const COOKIE_KEY = 'user_session_cookies';

const api = axios.create({
    baseURL: 'https://il4mb.merapihost.com/api',
    withCredentials: true,
    timeout: 10000, // Good practice for prod
});

/**
 * Syncs and persists cookies from the response
 */
api.interceptors.response.use(
    async (response) => {
        const setCookieHeaders = response.headers['set-cookie'];

        if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
            // 1. Get existing cookies to merge
            const existingRaw = await SecureStore.getItemAsync(COOKIE_KEY);
            const cookieMap = existingRaw ? parseCookies(existingRaw) : {};

            // 2. Merge new cookies into the map (handles updates/overwrites)
            setCookieHeaders.forEach((cookieStr) => {
                const parsed = parseSingleCookie(cookieStr);
                if (parsed.name) cookieMap[parsed.name] = parsed.value;
            });

            // 3. Serialize and save
            const serialized = Object.entries(cookieMap)
                .map(([name, value]) => `${name}=${value}`)
                .join('; ');

            await SecureStore.setItemAsync(COOKIE_KEY, serialized);
        }
        return response;
    },
    (error) => Promise.reject(error)
);

/**
 * Injects persisted cookies into outgoing requests
 */
api.interceptors.request.use(
    async (config) => {
        try {
            const cookies = await SecureStore.getItemAsync(COOKIE_KEY);
            if (cookies) {
                // Ensure we don't overwrite existing Cookie headers if set manually
                config.headers.Cookie = cookies;
            }
        } catch (e) {
            console.error('Failed to load cookies', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Helpers to manage cookie strings
 */
function parseSingleCookie(cookieStr: string) {
    const parts = cookieStr.split(';')[0].split('=');
    return { name: parts[0]?.trim(), value: parts[1]?.trim() };
}

function parseCookies(cookieStr: string) {
    return cookieStr.split(';').reduce((acc, current) => {
        const [name, value] = current.split('=');
        if (name && value) acc[name.trim()] = value.trim();
        return acc;
    }, {} as Record<string, string>);
}

export default api;
