import { UserIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const author = defineType({
    name: 'author',
    title: 'Author',
    type: 'document',
    icon: UserIcon,
    fields: [   // We get all these fields from github
        defineField({
            name: 'id', // this is the github id
            type: 'number',
        }),
        defineField({
            name: 'name',
            type: 'string',
        }),
        defineField({
            name: 'username',
            type: 'string',
        }),
        defineField({
            name: 'email',
            type: 'string',
        }),
        defineField({
            name: 'image',
            type: 'url',
        }),
        defineField({
            name: 'bio',
            type: 'text',
        }),
    ],
    preview: {  // this allows us to select the author by name and display it in the preview
        select: {
            title: 'name',
        }
    }
});