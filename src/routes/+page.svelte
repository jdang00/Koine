<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';

	import { getAllBooks, getChapters, getVerses } from './api/utils';

	let versions = ['esv', 'kjv', 'niv'];
	let verses: string[] = [];
	let isLoading = false;
	let books: string[] = [];
	let chapterButtons: string[] = [];
	let verseButtons: string[] = [];

	let selectedBook = '';

	async function fetchVerse(book: string, chapterVerse: string, version: string) {
		const response = await fetch(`/api/${book} ${chapterVerse} ${version}`);
		const data = await response.json();
		return data.text;
	}

	async function populateVerses() {
		isLoading = true;
		for (const version of versions) {
			const verse = await fetchVerse('1tim', '2:12', version);
			verses.push(verse);
		}
		isLoading = false;
	}

	onMount(() => {
		populateVerses();
		books = getAllBooks();
	});
</script>

<div class="flex flex-col h-full">
	<header class="py-4 px-12 flex items-center border-b border-gray-200">
		<div class="flex-1 flex items-center gap-4 justify-center">
			<Popover.Root>
				<Popover.Trigger><Button variant="ghost">1 Timothy 2:12</Button></Popover.Trigger>
				<Popover.Content class="grid grid-cols-6">
					<div class="col-span-6">
						<h1 class="text-xl font-semibold text-center mb-6 mt-3">Old Testament</h1>
					</div>
					{#each books as book}
						{#if book === 'Matthew'}
							<div class="col-span-6 border-t my-3">
								<h1 class="text-xl font-semibold text-center my-6">New Testament</h1>
							</div>
						{/if}
						<Button variant="ghost">{book}</Button>
					{/each}
				</Popover.Content>
			</Popover.Root>
		</div>
	</header>
	{#if isLoading}
		<p>Loading...</p>
	{:else}
		<div class="flex-1 flex min-h-screen">
			{#each verses as verse, i}
				<div class="flex flex-col">
					<header class="py-4 px-12 flex items-center border-b border-gray-200">
						<div class="flex-1 flex items-center gap-4 justify-center">
							<Button variant="ghost">{versions[i].toUpperCase()}</Button>
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
	{/if}
</div>
