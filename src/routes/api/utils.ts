import bibleData from '$lib/bible.json';


export function getAllBooks() {
    return bibleData.map(book => book.book);
}

export function getChapters(book: string) {
    const bookData = bibleData.find(b => b.book === book);
    return bookData ? bookData.chapters.map(ch => ch.chapter) : [];
}

export function getVerses(book: string, chapter: string) {
    const bookData = bibleData.find(b => b.book === book);
    const chapterData = bookData?.chapters.find(ch => ch.chapter === chapter);
    return chapterData ? Array.from({ length: parseInt(chapterData.verses) }, (_, i) => (i + 1).toString()) : [];
}
