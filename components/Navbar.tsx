import { auth, signIn, signOut } from '@/auth';
import { BadgePlus, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Navbar = async () => {
    // we are able to make the component async because it's a server-side component
    const session = await auth();

    return (
        <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
            <nav className="flex justify-between items-center">
                <Link href="/">
                    <Image
                        src={'/logo.png'}
                        alt="Logo"
                        width={144}
                        height={30}
                    />
                </Link>
                <div className="flex items-center justify-center space-x-5 text-black">
                    {session && session.user ? (
                        <>
                            <Link href={'/startup/create'}>
                                <span className='max-sm:hidden'>Create</span>
                                <BadgePlus className='sm:hidden size-6' />
                            </Link>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}
                                className='flex items-center'
                            >
                                <button type="submit">
                                    <span className='max-sm:hidden'>Logout</span>
                                    <LogOut className='sm:hidden size-6 text-pink-500' />
                                </button>
                            </form>
                            <Link href={`/user/${session?.id}`}>
                                <Avatar className='size-10'>
                                    <AvatarImage
                                        src={session?.user?.image || ""}
                                        alt={session?.user?.name || ""}
                                    />
                                    <AvatarFallback>
                                        {session?.user?.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </Link>
                        </>
                    ) : (
                        <form
                            action={async () => {
                                'use server'; // making it a server action
                                // but we can't use a server action in a client-side component (a button with an onClick event)
                                await signIn('github');
                            }}
                        >
                            <button type="submit">Login</button>
                        </form>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;

// Reference notes:
/* 
<button onClick={async () => {
    'use server'; // making it a server action
    // but we can't use a server action in a client-side component (a button with an onClick event)
    await signIn('github');
}}>
    <span>Login</span>
</button> 
*/
