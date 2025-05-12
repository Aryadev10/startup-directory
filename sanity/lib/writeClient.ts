import 'server-only';   // This import is only needed in the server build

import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, token } from '../env';

export const writeClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false, // Set to false if statically generating pages, if set to true, uses ISR or tag-based revalidation. It caches API responses for faster responses.
    token,
});

if(!writeClient.config().token) {
    throw new Error('Write token not found');
}
