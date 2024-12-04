
import { notFound } from 'next/navigation';

type BookDetail = {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  book_categories: number[];  
  date: string;  
};

async function fetchBook(slug: string): Promise<BookDetail | null> {
  const res = await fetch(`https://shricabs.com/wp-json/wp/v2/books?slug=${slug}`);
  if (!res.ok) {
    return null;
  }
  const books: BookDetail[] = await res.json();
  return books.length > 0 ? books[0] : null;
}

async function fetchCategories(categoryIds: number[]): Promise<string[]> {
  const res = await fetch(`https://shricabs.com/wp-json/wp/v2/book_categories?include=${categoryIds.join(',')}`);
  if (!res.ok) {
    return [];
  }
  const categories = await res.json();
  console.log("categories",categories)
  return categories.map((category: { name: string }) => category.name); 
}

export default async function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = await fetchBook(params.slug);

  if (!book) {
    notFound(); 
  }

  const categoryNames = await fetchCategories(book.book_categories);

  const publishedDate = new Date(book.date).toLocaleDateString();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{book.title.rendered}</h1>

      <div className="text-sm text-gray-500 mb-4">
        Categories: {categoryNames.join(', ')}
      </div>

      <div className="text-sm text-gray-500 mb-6">
        Published on: {publishedDate}
      </div>

      <div
        className="book-content text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: book.content.rendered }}
      />
    </div>
  );
}
