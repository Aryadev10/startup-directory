'use server';

import { auth } from '@/auth';
import { parseServerActionResponse } from './utils';
import slugify from 'slugify';
import { writeClient } from '@/sanity/lib/writeClient';

export const createPitch = async (
    state: any,
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
    const session = await auth();
    if (!session) {
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Not signed in',
        });
    }

    try {
        // Get the current startup document to check if user has already liked it
        const startup = await writeClient.fetch(`*[_type == "startup" && _id == $startupId][0]{
            likes,
            "likedBy": likedBy[]._ref
        }`, { startupId });

        const isLiked = startup.likedBy && startup.likedBy.includes(session.id);
        
        if (isLiked) {
            // Unlike the startup
            await writeClient
                .patch(startupId)
                .dec({ likes: 1 })
                .unset([`likedBy[_ref == "${session.id}"]`])
                .commit();

            return parseServerActionResponse({
                status: 'SUCCESS',
                action: 'UNLIKED',
            });
        } else {
            // Like the startup
            await writeClient
                .patch(startupId)
                .inc({ likes: 1 })
                .setIfMissing({ likedBy: [] })
                .append('likedBy', [{ _type: 'reference', _ref: session.id }])
                .commit();

            return parseServerActionResponse({
                status: 'SUCCESS',
                action: 'LIKED',
            });
        }
    } catch (error) {
        console.error('Like error:', error);
        return parseServerActionResponse({
            status: 'ERROR',
            error: 'Failed to update like status',
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
