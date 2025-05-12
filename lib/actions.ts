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
