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