<script lang="ts">
	import Dropzone from "svelte-file-dropzone";
	import '../app.css';
	import { calculateCost } from '$lib/actions/calculate-cost';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Select from "$lib/components/ui/select";
	import { onMount } from 'svelte';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from "$lib/components/ui/badge";
	import { OnPaymentSuccessed } from '$lib/actions/on-payment-successed';

	const languageMapping = [
		{ language: 'English (United Kingdom)', code: 'en-GB' },
		{ language: 'English (United States)', code: 'en-US' },
		{ language: 'French', code: 'fr-FR' },
		{ language: 'Italian', code: 'it-IT' },
		{ language: 'Spanish',  code: 'es-ES' },
		{ language: 'German',  code: 'de-DE' },
	]

	let resume: {id: string, fileName: string, duration: number, cost: number, extension: string, language?: string, file: File}[] = []
	let email: string;
	let checkoutId: string;
	let languagesIsSet = false;

	const removeFile = (id: string) => {
		resume = resume.filter(f => f.id !== id);
	}

	$: {
		if (resume?.length === 0) {
			languagesIsSet = false;
		} else {
			languagesIsSet = resume.filter(r => !r.language).length === 0;
		}
	}

	onMount(() => {
		if (typeof window === 'undefined') {
			return;
		}
		// @ts-ignore
		LemonSqueezy.Setup({
			eventHandler: async (event: any) => {
				if (event.event === 'Checkout.Success') {
					await OnPaymentSuccessed(
						resume.map(r => {
							return {
								file: r.file,
								language: r.language as string,
								fileName: r.fileName,
							}
						}),
						email,
						checkoutId,
						event.data.order.data.id
					)
					// @ts-ignore
					LemonSqueezy.Url.Close();
					// Redirect on success ?
				}
			}
		})
	});

	const handleDropFiles = async (e: {detail: {acceptedFiles: FileList, fileRejections: any}}) => {
		const { acceptedFiles } = e.detail;
		await Promise.all(Array.from(acceptedFiles).map(async (file) => {
			const res = await calculateCost(file);
			const extension = file.name.split('.').pop() as string;
			resume = [
				...resume,
				{
					file,
					id: (37e16 * Math.random() + 37e16).toString(32),
					extension: extension,
					fileName: file.name.trim().replace(`.${extension}`, ''),
					duration: res.duration,
					cost: res.cost,
				},
			];
		}))
	}

	const createCheckout = async () => {
		if (!email) {
			return;
		}

		const price = total + 1
		const response = await fetch('/api/createCheckout', {
			method: 'POST',
			body: JSON.stringify({price, email}),
			headers: {
				'Accept': 'application/json',
			}
		});

		const res = await response.json();
		checkoutId = res.checkout.id;
		// @ts-ignore
		LemonSqueezy.Url.Open(res.checkout.url);
	}

	let total: number;
	$: total = resume.map(i => i.cost).reduce((a, b) => a + b, 0);

	const formatDuration = (duration: number) => {
		const min = Math.floor(duration / 60);
		const secondesleft = duration % 60;

		return `${min}:${secondesleft < 10 ? '0' : ''}${secondesleft}`;
	}

	const onSelectLanguageChange = (itemId: string, value: unknown | undefined) => {
		resume = resume.map(r => {
			if (r.id === itemId) {
				return {
					...r,
					language: value ? value as string : undefined,
				}
			}

			return r;
		})
	}
</script>
<svelte:head>
	<script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-screen">
	<header class="w-9/12 py-4 text-center">
		<h1 class="text-2xl font-bold text-primary">Transcribolt</h1>
		<p class="mt-4">Transform your spoken words into written text effortlessly with our no-signup speech to text transcription tool. Enjoy fast, accurate transcriptions directly in your browser, without the need for accounts or commitments. Perfect for students, professionals, and anyone needing quick and reliable transcription services.</p>
	</header>
	<main class="flex-1 flex flex-col items-center px-4 mt-28 w-9/12 space-y-2">
		<div class="w-full flex items-center justify-center">
			<Dropzone
				on:drop={handleDropFiles}
				accept={['video/*', 'audio/*']}
				disableDefaultStyles={true}
				containerClasses="bg-default rounded-lg cursor-pointer w-full {resume.length > 0 ? 'h-32' : 'h-64'} border-2 border-primary border-dashed text-center text-white"
			>
				<div class="flex flex-col items-center justify-center pt-5 pb-6 text-primary">
					<svg class="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
					<p class="mb-2 text-sm dark:text-white text-black"><span class="font-semibold">Click to upload</span> or drag and drop</p>
					<p class="text-xs dark:text-white text-black">audio or video file(s)</p>
				</div>
			</Dropzone>
		</div>
		<div class="flex flex-col space-y-2 w-full text-center p-4 text-xl">
			{#if resume.length > 0}
				<p>Please select the language of the audio file(s) to proceed with transcription.</p>
				<p>You can rename your files if you want</p>
			{/if}
			{#each resume as item}
				<div class="flex justify-around text-center space-x-2 border rounded-xl p-4">
					<div class="w-3/12 flex flex-col gap-1.5 text-left">
						<Label for="{item.id}_language">File language</Label>
						<Select.Root onSelectedChange={(e) => onSelectLanguageChange(item.id, e?.value)} selected={{value: item.language, label: languageMapping.find(l => l.code === item.language)?.language}}>
							<Select.Trigger id="{item.id}_language" class="w-full">
								<Select.Value placeholder="Select file language" />
							</Select.Trigger>
							<Select.Content class="w-full">
								{#each languageMapping as language}
									<Select.Item value="{language.code}">{language.language}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					<div class="w-3/12 flex flex-col gap-1.5 text-left">
						<Label for="{item.id}_filename">Filename</Label>
						<Input id="{item.id}_filename" bind:value={item.fileName} on:change={e => item.fileName = e.currentTarget.value.trim().toLowerCase()} class="w-full" />
					</div>
					<div class="w-2/12 flex flex-col gap-1.5">
						<Label>Duration</Label>
						<span>{formatDuration(item.duration)}</span>
					</div>
					<div class="w-2/12 flex flex-col gap-1.5">
						<Label>Cost</Label>
						<span>{item.cost}$</span>
					</div>
					<div class="w-1/12 flex flex-col gap-1.5">
						<Button on:click={() => removeFile(item.id)}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
								<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
							</svg>
						</Button>
					</div>
				</div>
			{/each}
		</div>
		{#if languagesIsSet}
			<hr />
			<div class="flex justify-between w-full">
				<div class="w-1/4 p-2">
					Transaction cost <Badge>1$</Badge>
				</div>
				<div class="w-1/4 p-2">
					Total <Badge>{total + 1}$</Badge>
				</div>
				<div class="w-1/4"><Input name="email" placeholder="Email" bind:value={email} /></div>
				<div class="w-1/4 flex justify-end"><Button on:click={createCheckout} disabled={!Boolean(email)}>Go</Button></div>
			</div>
		{/if}
	</main>
</div>