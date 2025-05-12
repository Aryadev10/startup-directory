import { auth } from '@/auth';
import { StartupCardSkeleton } from '@/components/StartupCard';
import UserStartups from '@/components/UserStartups';
import { client } from '@/sanity/lib/client';
import { AUTHOR_BY_ID_QUERY } from '@/sanity/lib/queries';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const experimental_ppr = true; // this component is the perfect example for ppr, as the user data stays constant but the startup data changes

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await auth();

    // console.log(session.id);

    const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
    if (!user) return notFound();
    return (
        <>
            <section className="profile_container">
                <div className="profile_card">
                    <div className="profile_title">
                        <h3 className="text-24-black uppercase text-center line-clamp-1">
                            {user.name}
                        </h3>
                    </div>
                    <Image
                        src={user.image}
                        alt={user.name}
                        width={220}
                        height={220}
                        className="profile_image"
                    />
                    <p className="text-30-extrabold mt-7 text-center">
                        @{user?.username}
                    </p>
                    <p className="mt-1 text-center text-14-normal">
                        {user?.bio}
                    </p>
                </div>
                <div className="flex flex-1 flex-col gap-5 lg:-mt-5">
                    <p className="text-30-bold">
                        {session?.id === id ? 'Your' : `${user.name}'s`}{' '}
                        startups
                    </p>
                    <ul className="card_grid-sm">
                        <Suspense fallback={<StartupCardSkeleton />}>
                            <UserStartups id={id} />
                        </Suspense>
                    </ul>
                </div>
            </section>
        </>
    );
};

export default page;
