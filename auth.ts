import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { writeClient } from './sanity/lib/writeClient';
import { client } from './sanity/lib/client';
import { AUTHOR_BY_GITHUB_ID_QUERY } from './sanity/lib/queries';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID,
        clientSecret: process.env.AUTH_GITHUB_SECRET,
    })],
    callbacks: {    // Callbacks are functions that are called during the sign in process
        async signIn({user, profile}){
            // console.log('signIn', {user, profile});
            const existingUser = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID_QUERY, {id: profile?.id});  // we set useCdn to false to get the latest data
            // console.log('existingUser', existingUser);

            if(!existingUser){
                await writeClient.create({
                    _type: 'author',
                    id: profile?.id,
                    name: user?.name,
                    username: profile?.login,
                    image: user?.image,
                    bio: profile?.bio,
                    email: user?.email
                })
            }

            return true;
        },
        // after a successful sign in, we need to create an author id from sanity to use it on profile or new startup
        // for that we will modify the default jwt token to include the author id
        async jwt({token, account, profile}){
            if(account && profile) {
                const user = await client.withConfig({useCdn: false}).fetch(AUTHOR_BY_GITHUB_ID_QUERY, {id: profile?.id});
                token.id = user._id;
            }
            return token;
        },   // this will allow to connect the specific github user with a sanity author which can then create a startup
        async session({ session, token }){
            Object.assign(session, { id: token.id });
            return session;
        } 
    }
});
