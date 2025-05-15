import { defineQuery } from 'next-sanity';

export const STARTUPS_QUERY =
    defineQuery(`*[_type == 'startup' && defined(slug.current) && !defined($search) || title match $search || category match $search || author->name match $search] | order(_createdAt desc) {
        _id,
        title, 
        slug, 
        _createdAt, 
        author -> {_id, name, image, bio}, 
        views, 
        likes,
        description, 
        category, 
        image
    }`);

export const STARTUP_BY_ID_QUERY =
    defineQuery(`*[_type == 'startup' && _id == $id][0] {
    _id,
    title, 
    slug, 
    _createdAt, 
    author -> {_id, name, username, image, bio}, 
    views, 
    likes,
    "likedBy": likedBy[]._ref,
    description, 
    category, 
    image, 
    pitch
    }`);

export const STARTUP_VIEWS_QUERY =
    defineQuery(`*[_type == 'startup' && _id == $id][0] {
    _id,
    views
}`);

export const COMMENTS_BY_STARTUP_QUERY =
    defineQuery(`*[_type == 'comment' && startup._ref == $startupId] | order(createdAt desc) {
    _id,
    text,
    createdAt,
    author -> {_id, name, username, image}
}`);

export const AUTHOR_BY_GITHUB_ID_QUERY = defineQuery(`
    *[_type == "author" && id == $id][0]{
        _id,
        id,
        name,
        username,
        email,
        image,
        bio
    }
    `);

export const AUTHOR_BY_ID_QUERY = defineQuery(`
    *[_type == "author" && _id == $id][0]{
        _id,
        id,
        name,
        username,
        email,
        image,
        bio
    }
    `);

export const STARTUPS_BY_AUTHOR_QUERY =
    defineQuery(`*[_type == 'startup' && author._ref == $id] | order(_createdAt desc) {
        _id,
        title, 
        slug, 
        _createdAt, 
        author -> {_id, name, image, bio}, 
        views, 
        likes,
        description, 
        category, 
        image
    }`);

export const PLAYLIST_BY_SLUG_QUERY =
    defineQuery(`*[_type == 'playlist' && slug.current == $slug][0] {
        _id,
        title, 
        slug, 
        select[] -> {
            _id, 
            title, 
            slug, 
            _createdAt, 
            author -> 
                {
                    _id, 
                    name, 
                    slug, 
                    image, 
                    bio
                }, 
            views, 
            likes,
            description, 
            category, 
            image, 
            pitch
        }
    }`);
