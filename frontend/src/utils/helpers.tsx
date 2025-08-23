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


/**
 * Call endpoint and return the response as a Promise of a JSON object
 * @param endpoint Endpoint to call, e.g. "api/nyt/spelling_bee"
 * @param body Body to send in the request, should be a JSON object
 * @returns 
 */
export const callEndpoint = async (endpoint: string, body: any): Promise<any> => {
    const res = await fetch('http://localhost:5001/' + endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
}