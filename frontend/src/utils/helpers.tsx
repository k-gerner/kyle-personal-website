/**
 * Split array into smaller chunks
 * @param array Arrray of strings to be chunked
 * @param chunkSize Size of each chunk
 * @returns Array of string arrays, each containing a chunk of the original array
 */
export const chunkArray = (array: string[], chunkSize: number): string[][] => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};


const BACKEND_API_PREFIX = process.env.REACT_APP_LOCAL_DEV === 'true'
    ? 'http://localhost:5001'
    : 'https://kyle-ai-backends.vercel.app';

const MAX_REQUEST_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

const wait = (duration: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, duration));

/**
 * Call endpoint and return the response as a Promise of a JSON object
 * @param endpoint Endpoint to call, e.g. "api/nyt/spelling_bee"
 * @param body Body to send in the request, should be a JSON object
 * @returns Promise resolving to the JSON response from the endpoint
 */
export const callEndpoint = async (endpoint: string, body: any): Promise<any> => {
    const url = BACKEND_API_PREFIX + '/' + endpoint;

    for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
        let res: Response | null = null;
        try {
            res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
        } catch (error) {
            // Failed fetches have no HTTP status, so they are transient network
            // failures such as ERR_NETWORK_CHANGED or a reset connection.
            if (attempt === MAX_REQUEST_ATTEMPTS) {
                throw error;
            }
        }

        if (res === null) {
            const backoff = 250 * (2 ** (attempt - 1));
            const jitter = Math.floor(Math.random() * 100);
            await wait(backoff + jitter);
            continue;
        }

        if (res.ok) {
            return await res.json();
        }

        if (!RETRYABLE_STATUS_CODES.has(res.status) || attempt === MAX_REQUEST_ATTEMPTS) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        // 250ms, 500ms, then 1s, with a small amount of jitter.
        const backoff = 250 * (2 ** (attempt - 1));
        const jitter = Math.floor(Math.random() * 100);
        await wait(backoff + jitter);
    }

    throw new Error(`Request failed: ${url}`);
}

/**
 * Pause execution for a given duration
 * @param duration Duration to pause in milliseconds
 */
export const pause = async (duration: number) => {
    return new Promise(resolve => setTimeout(resolve, duration));
};
