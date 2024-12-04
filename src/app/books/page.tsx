import Link from 'next/link';

type Book = {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  book_categories: number[];  
  excerpt: {
    rendered: string; 
  };
  date: string; 
};

async function fetchBooks(): Promise<Book[]> {
  const res = await fetch('https://shricabs.com/wp-json/wp/v2/books');
  if (!res.ok) {
    throw new Error('Failed to fetch books');
  }
  return res.json();
}

async function fetchCategories(categoryIds: number[]): Promise<string[]> {
  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return []; 
  }

  const res = await fetch(`https://shricabs.com/wp-json/wp/v2/book_categories?include=${categoryIds.join(',')}`);
  if (!res.ok) {
    return [];
  }
  const categories = await res.json();
  return categories.map((category: { name: string }) => category.name);
}

export default async function BooksPage() {
  const books = await fetchBooks();

  const booksWithCategories = await Promise.all(
    books.map(async (book) => {
      const categoryNames = await fetchCategories(book.book_categories || []);
      return { ...book, categoryNames };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Books Listing</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {booksWithCategories.map((book) => (
          <div key={book.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">
                <Link href={`/books/${book.slug}`} className="text-blue-500 hover:underline">
                  {book.title.rendered}
                </Link>
              </h2>

              <div className="text-sm text-gray-500 mb-4">
                Categories: {book.categoryNames.length > 0 ? book.categoryNames.join(', ') : 'No categories available'}
              </div>

              <p className="text-gray-700 text-base mb-4">
                {book.excerpt.rendered.replace(/<[^>]+>/g, '')} {/* Remove HTML tags from excerpt */}
              </p>

              <div className="text-sm text-gray-500 mb-4">
                Published on: {new Date(book.date).toLocaleDateString()}
              </div>

              <Link
                href={`/books/${book.slug}`}
                className="text-white bg-blue-500 hover:bg-blue-700 rounded-full py-2 px-6 mt-4 inline-block"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
