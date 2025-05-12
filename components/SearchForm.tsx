import Form from 'next/form';
import SearchFormReset from './SearchFormReset';
import { Search } from 'lucide-react';

const SearchForm = ({query}: {query?: string}) => {
// Here we are handling the form on the server side using the latest form features of react 19 and nextjs 15
    return (
        // If action is a string, it will be interpreted as a path or URL to navigate to when the form is submitted. The path will be prefetched when the form becomes visible.
        <Form action="/" scroll={false} className="search-form">
            <input
                name="query"
                defaultValue={query}
                className="search-input"
                placeholder="Search for startups"
            />
            <div className="flex gap-2">
                {query && <SearchFormReset />}
                <button type="submit" className="search-btn text-white"><Search className='size-5' />
                </button>
            </div>
        </Form>
    );
};

export default SearchForm;
