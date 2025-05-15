'use server';

import { auth } from '@/auth';
import { parseServerActionResponse } from './utils';
import slugify from 'slugify';
import { writeClient } from '@/sanity/lib/writeClient';

export const createPitch = async (
    state: Record<string, unknown>,
    form: FormData,
    pitch: string
) => {
    const session = await auth();
    if (!session) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Not signed in',
        });
    }

    // const { title, description, category, link } = Object.fromEntries(
    //     Array.from(form.entries().filter(([key]) => key !== 'pitch'))
    // );
    const { title, description, category, link } = Object.fromEntries(
        Array.from(form.entries()).filter(([key]) => key !== 'pitch')
    );
    

    const slug = slugify(title as string, { lower: true });

    try {
        const startup = {   // convert the form data to a format that can be sent to the sanity server
            title,
            description,
            category,
            image: link,
            pitch,
            slug: {
                _type: slug,
                current: slug,
            }, 
            author: {
                _type: 'reference',
                _ref: session?.id,
            }, 
            views: 0,
            likes: 0,
            likedBy: [],
        };

        const result = await writeClient.create({
            _type: 'startup',
            ...startup,
        });

        return parseServerActionResponse({
            status: 'SUCCESS',
            error: '',
            ...result,
        });
    } catch (error) {
        console.log(error);

        return parseServerActionResponse({
            status: 'ERROR',
            error: JSON.stringify(error),
        });
    }
};

export const likeStartup = async (startupId: string) => {
    // Validate inputs
    if (!startupId) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Invalid startup ID',
        });
    }

    const session = await auth();
    if (!session) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Not signed in',
        });
    }

    // Validate Sanity client
    if (!writeClient.config().token) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Sanity write token is missing. Make sure SANITY_WRITE_TOKEN is set in your environment.',
        });
    }

    try {
        // First check if the startup exists
        const startupExists = await writeClient.fetch(`*[_type == "startup" && _id == $startupId][0]._id`, { startupId });
        
        if (!startupExists) {
            return parseServerActionResponse({
                status: 'ERROR',
                error: 'Startup not found',
            });
        }

        // Get the current startup document to check if user has already liked it
        const startup = await writeClient.fetch(`*[_type == "startup" && _id == $startupId][0]{
            likes,
            "likedBy": likedBy[]._ref
        }`, { startupId });

        if (!startup) {
            return parseServerActionResponse({
                status: 'ERROR',
                error: 'Failed to fetch startup details',
            });
        }

        // Initialize likes if it doesn't exist
        if (typeof startup.likes !== 'number') {
            await writeClient
                .patch(startupId)
                .set({ likes: 0 })
                .commit();
            
            startup.likes = 0;
        }

        // Initialize likedBy array if it doesn't exist
        const likedBy = startup.likedBy || [];
        const isLiked = likedBy.includes(session.id);
        
        if (isLiked) {
            // Unlike the startup
            try {
                await writeClient
                    .patch(startupId)
                    .dec({ likes: 1 })
                    .setIfMissing({ likedBy: [] }) // Ensure likedBy exists
                    .unset([`likedBy[_ref == "${session.id}"]`])
                    .commit();

                return parseServerActionResponse({
                    status: 'SUCCESS',
                    action: 'UNLIKED',
                });
            } catch (patchError) {
                console.error('Error unliking startup:', patchError);
                return parseServerActionResponse({
                    status: 'ERROR',
                    error: `Failed to unlike: ${patchError instanceof Error ? patchError.message : 'Unknown error'}`,
                });
            }
        } else {
            // Like the startup
            try {
                await writeClient
                    .patch(startupId)
                    .setIfMissing({ likes: 0 }) // Ensure likes exists and is initialized
                    .inc({ likes: 1 })
                    .setIfMissing({ likedBy: [] })
                    .append('likedBy', [{ _type: 'reference', _ref: session.id }])
                    .commit();

                return parseServerActionResponse({
                    status: 'SUCCESS',
                    action: 'LIKED',
                });
            } catch (patchError) {
                console.error('Error liking startup:', patchError);
                return parseServerActionResponse({
                    status: 'ERROR',
                    error: `Failed to like: ${patchError instanceof Error ? patchError.message : 'Unknown error'}`,
                });
            }
        }
    } catch (error) {
        console.error('Like error:', error);
        return parseServerActionResponse({
            status: 'ERROR',
            error: `Failed to update like status: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
    }
};

export const createComment = async (startupId: string, text: string) => {
    const session = await auth();
    if (!session) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Not signed in',
        });
    }

    try {
        const comment = {
            _type: 'comment',
            text,
            author: {
                _type: 'reference',
                _ref: session.id,
            },
            startup: {
                _type: 'reference',
                _ref: startupId,
            },
            createdAt: new Date().toISOString(),
        };

        const result = await writeClient.create(comment);

        return parseServerActionResponse({
            status: 'SUCCESS',
            ...result,
        });
    } catch (error) {
        console.error('Comment error:', error);
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Failed to create comment',
        });
    }
};
