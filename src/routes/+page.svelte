<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { ArrowLeft } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { ArrowRight } from 'lucide-svelte';

	import { getAllBooks, getChapters, getVerses } from './api/utils';

	let fullVersion = ['kjv', 'niv', 'esv', 'nasb', 'nkjv', 'amp', 'nlt', 'asv', 'bbe'];

	let versions = ['esv', 'kjv', 'niv'];
	let verses: string[] = [];
	let isLoading = false;
	let books: string[] = [];
	let chapters: string[] = [];
	let verseButtons: string[] = [];

	let selectedBook = '';
	let selectedChapters = '';
	let selectedVerse = '';

	let headerText = '1 Timothy 2:12';

	let firstLoadIdentifier = false;

	function updateHeader() {
		headerText = `${selectedBook} ${selectedChapters}:${selectedVerse}`;
	}

	function handleBookClick(book: string) {
		selectedBook = book;
		chapters = getChapters(selectedBook);
	}

	function handleChapterClick(chapter: string) {
		selectedChapters = chapter;
		verseButtons = getVerses(selectedBook, selectedChapters);
	}

	async function fetchVerse(book: string, chapterVerse: string, version: string) {
		const response = await fetch(`/api/${book} ${chapterVerse} ${version}`);
		const data = await response.json();
		return data.text;
	}

	async function replaceVerseVersion(
		book: string,
		chapter: string,
		verse: string,
		index: number,
		version: string,
		firstLoad: boolean
	) {
		if (!firstLoad) {
			const verseText = await fetchVerse('1tim', `2:12`, version);
			verses[index] = verseText;
			versions[index] = version;
		} else {
			const formattedBook = book.replace(/\s+/g, '').toLowerCase();
			const verseText = await fetchVerse(formattedBook, `${chapter}:${verse}`, version);
			verses[index] = verseText;
			versions[index] = version;
		}
	}

	async function populateVerses(book: string, chapter: string, verse: string, firstLoad: boolean) {
		const formattedBook = book.replace(/\s+/g, '').toLowerCase();

		isLoading = true;
		verses = [];
		for (const ver of versions) {
			const verseText = await fetchVerse(formattedBook, `${chapter}:${verse}`, ver);
			verses.push(verseText);
		}
		isLoading = false;
		if (firstLoad) {
		} else {
			firstLoadIdentifier = true;

			selectedBook = book;
			selectedChapters = chapter;
			selectedVerse = verse;
			updateHeader();
		}
	}

	async function nextVerse(verse: string) {
		if (parseInt(verse) >= getVerses(selectedBook, selectedChapters).length) {
		} else {
			let stringNum = parseInt(verse);
			stringNum++;
			populateVerses(selectedBook, selectedChapters, stringNum.toString(), false);
		}
	}

	onMount(() => {
		populateVerses('1 Timothy', '2', '12', true);

		books = getAllBooks();
	});
</script>

<svelte:head>
	<title>Koine Bible Translation Comparison</title>
	<meta
		name="description"
		content="A Bible comparison tool that is fast, beautiful, and faithful."
	/>
</svelte:head>

<div class="flex flex-col h-full">
	<header class="py-4 px-12 flex items-center border-b border-gray-200">
		<div class="flex-1 flex items-center gap-4 justify-center">
			<Popover.Root>
				<Popover.Trigger><Button variant="ghost">{headerText}</Button></Popover.Trigger>
				<Popover.Content class="grid grid-cols-6">
					{#if !selectedBook}
						<div class="col-span-6">
							<h1 class="text-xl font-semibold text-center mb-6 mt-3">Old Testament</h1>
						</div>
						{#each books as book}
							{#if book === 'Matthew'}
								<div class="col-span-6 border-t my-3">
									<h1 class="text-xl font-semibold text-center my-6">New Testament</h1>
								</div>
							{/if}
							<Button variant="ghost" on:click={() => handleBookClick(book)}>{book}</Button>
						{/each}
					{:else if !selectedChapters}
						<div class="col-span-6 flex flex-row gap-2 pb-3">
							<Button variant="ghost" on:click={() => (selectedBook = '')}><ArrowLeft /></Button>
							<h1 class="text-xl font-semibold text-center self-center">{selectedBook}</h1>
						</div>

						{#each chapters as chapter}
							<Button variant="ghost" on:click={() => handleChapterClick(chapter)}>{chapter}</Button
							>
						{/each}
					{:else}
						<div class="col-span-6 flex flex-row gap-2 pb-3">
							<Button variant="ghost" on:click={() => (selectedChapters = '')}><ArrowLeft /></Button
							>
							<h1 class="text-xl font-semibold text-center self-center">
								{selectedBook} : {selectedChapters}
							</h1>
						</div>

						{#each verseButtons as verse}
							<Button
								variant="ghost"
								on:click={() => populateVerses(selectedBook, selectedChapters, verse, false)}
								>{verse}</Button
							>
						{/each}
					{/if}
				</Popover.Content>
			</Popover.Root>
		</div>
		<Button variant="ghost" on:click={() => nextVerse(selectedVerse)}><ArrowRight /></Button>
	</header>
	{#if isLoading}
		<p>Loading...</p>
	{:else}
		<div class="flex-1 flex min-h-screen">
			<div class="columns-3 gap-0">
				{#each verses as verse, i}
					<div class="flex flex-col min-h-screen">
						<header class="py-4 px-12 flex items-center border-b border-gray-200">
							<div class="flex-1 flex items-center gap-4 justify-center">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button variant="ghost">{versions[i].toUpperCase()}</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Group>
											{#each fullVersion as version}
												{#if !(version == versions[i])}
													<DropdownMenu.Item
														on:click={() =>
															replaceVerseVersion(
																selectedBook,
																selectedChapters,
																selectedVerse,
																i,
																version,
																firstLoadIdentifier
															)}>{version.toUpperCase()}</DropdownMenu.Item
													>
												{/if}
											{/each}
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</header>
						<div class="flex-1 border-r border-gray-200 overflow-auto">
							<div class="p-4">
								<pre class="whitespace-pre-wrap font-mono text-sm">{verse}</pre>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
