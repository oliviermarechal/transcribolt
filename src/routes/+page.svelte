<script lang="ts">
	import Dropzone from "svelte-file-dropzone";
	import '../app.css';
	import { calculateCost } from '$lib/actions/calculate-cost';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import PaymentModal from "$lib/components/payment-modal.svelte";
	import * as Select from "$lib/components/ui/select";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Label } from '$lib/components/ui/label';
	import { Badge } from "$lib/components/ui/badge";
	import { OnPaymentSuccessed, type OutputFormat } from '$lib/actions/on-payment-successed';

	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	import Speech from "lucide-svelte/icons/speech";
	import Zap from "lucide-svelte/icons/zap";
	import Users from "lucide-svelte/icons/users";

	import { toggleMode, ModeWatcher } from "mode-watcher";
	const languageMapping = [
		{ language: 'English', code: 'en' },
		{ language: 'French', code: 'fr' },
		{ language: 'Italian', code: 'it' },
		{ language: 'Spanish',  code: 'es' },
		{ language: 'German',  code: 'de' },
	]

	const outputFormatAvailable = ['json', 'text', 'srt', 'verbose_json', 'vtt'];
	const maxSize = 50 * 1024 * 1024;
	let totalSize = 0;
	$: totalSize = resume.reduce((acc, resume) => acc + resume.file.size, 0)

	let resume: {
		id: string,
		fileName: string,
		duration: number,
		cost: number,
		extension: string,
		language?: string,
		outputFormat: OutputFormat,
		file: File,
	}[] = []
	let email: string;
	let clientSecret: string | null;
	let isComplete = false;
	let loading = false;
	let error: string | null = null;

	const removeFile = (id: string) => {
		resume = resume.filter(f => f.id !== id);
	}

	$: {
		if (resume?.length === 0) {
			isComplete = false;
		} else {
			isComplete = resume.filter(r => !r.language || !r.outputFormat).length === 0;
			if (totalSize > maxSize) {
				error = `The total file size exceeds the 50MB limit. Current size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB.`;
			} else {
				error = '';
			}
		}
	}

	const onPaymentSuccess = async (checkoutId: string) => {
		clientSecret = null;
		loading = true;
		const response = await OnPaymentSuccessed(
			resume.map(r => {
				return {
					file: r.file,
					language: r.language as string,
					fileName: `${r.fileName}.${r.extension}`,
					outputFormat: r.outputFormat,
				}
			}),
			checkoutId,
		)
		loading = false;

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = url;
			a.download = 'transcriptions.zip';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);

			resume = [];
			email = '';
			clientSecret = null;
			isComplete = false;
		}
	}

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
					outputFormat: 'text',
				},
			];
		}))
	}

	const createCheckout = async () => {
		if (!email || Boolean(error)) {
			return;
		}

		const price = Math.round((total + 1) * 100)
		const response = await fetch('/api/createCheckout', {
			method: 'POST',
			body: JSON.stringify({price, email}),
			headers: {
				'Accept': 'application/json',
			}
		});

		const res = await response.json();
		clientSecret = res.clientSecret
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

	const onSelectOutputFormatChange = (itemId: string, value: unknown | undefined) => {
		resume = resume.map(r => {
			if (r.id === itemId) {
				return {
					...r,
					outputFormat: value ? value as OutputFormat : 'text',
				}
			}

			return r;
		})
	}
</script>

<ModeWatcher defaultMode="system" />
{#if loading}
	<div class="flex flex-col items-center justify-center min-h-screen">
		<div class="loader"></div>
	</div>
{:else}
	<div class="flex flex-col items-center justify-center min-h-screen">
		<header class="w-9/12 py-4 text-center">
			<h1 class="text-4xl font-bold text-primary">Transcribolt</h1>
			<div class="absolute right-1/4 top-3">
				<Button on:click={toggleMode} variant="outline" size="icon">
					<Sun class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<Moon class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span class="sr-only">Toggle theme</span>
				</Button>
			</div>
			<div class="mt-4 ml-28 space-y-2">
				<div class="text-left flex flex-row space-x-2"><Speech /><p>Transform your spoken words into written text effortlessly with our no-signup online speech to text transcription tool.</p></div>
				<div class="text-left flex flex-row space-x-2"><Zap /><p>Enjoy fast, accurate transcriptions directly in your browser, without the need for accounts or commitments.</p></div>
				<div class="text-left flex flex-row space-x-2"><Users /><p>Perfect for students, professionals, and anyone needing quick and reliable transcription services.</p></div>
			</div>
		</header>
		<main class="flex-1 flex flex-col items-center px-4 mt-14 mb-28 w-9/12 space-y-2">
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
					<p>Please select the language of the audio file(s) and the output format to proceed with transcription.</p>
				{/if}
				{#each resume as item}
					<div class="flex justify-around items-center text-center space-x-2 border rounded-xl p-4">
						<div class="w-3/12 flex flex-col gap-1.5 text-left">
							<Label for="{item.id}_language">File language</Label>
							<Select.Root onSelectedChange={(e) => onSelectLanguageChange(item.id, e?.value)} selected={{value: item.language, label: languageMapping.find(l => l.code === item.language)?.language}}>
								<Select.Trigger id="{item.id}_language" class="w-full {item.language === undefined ? ' border-4 border-red-700' : ''}">
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
							<Label for="{item.id}_format">Output format</Label>
							<Select.Root onSelectedChange={(e) => onSelectOutputFormatChange(item.id, e?.value)} selected={{value: item.outputFormat, label: item.outputFormat}}>
								<Select.Trigger id="{item.id}_format" class="w-full">
									<Select.Value placeholder="Select output format" />
								</Select.Trigger>
								<Select.Content class="w-full">
									{#each outputFormatAvailable as format}
										<Select.Item value="{format}">{format}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="w-3/12 flex flex-col gap-1.5 text-left">
							<Label for="{item.id}_filename">Filename</Label>
							<Input id="{item.id}_filename" bind:value={item.fileName} on:change={e => item.fileName = e.currentTarget.value.trim().toLowerCase()} class="w-full" />
						</div>
						<div class="w-2/12 flex flex-col gap-1.5">
							<Label>Duration / cost </Label>
							<span class="text-sm">{formatDuration(item.duration)} / {item.cost}$</span>
						</div>
						<div class="w-1/12 flex flex-col gap-1.5">
							<Button variant="ghost" on:click={() => removeFile(item.id)}>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-primary">
									<path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
								</svg>
							</Button>
						</div>
					</div>
				{/each}
				{#if resume?.length > 0}
					{#if totalSize}
						<p class="text-sm">File size: {(totalSize / (1024 * 1024)).toFixed(2)} MB. Maximum allowed: {(maxSize / (1024 * 1024)).toFixed(2)} MB.</p>
						<div class="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
							<div class="{error ? 'bg-destructive' : 'bg-primary'} h-2.5 rounded-full" style="width: {Math.min(100, (totalSize / maxSize) * 100)}%"></div>
						</div>
					{/if}

					{#if error}
						<p class="text-red-600 text-sm mb-4">{error}</p>
					{/if}

				{/if}
			</div>
			{#if resume?.length > 0}
				<hr />
				<div class="flex justify-between w-full">
					<div class="w-1/4 p-2">
						Transaction cost <Badge>1$</Badge>
					</div>
					<div class="w-1/4 p-2">
						Total <Badge>{total + 1}$</Badge>
					</div>
					<div class="w-1/4"><Input name="email" placeholder="Email" bind:value={email} class="{email ? '' : 'border-4 border-red-700'}" /></div>
					<div class="w-1/4 flex justify-end"><Button on:click={createCheckout} disabled={!Boolean(email) || Boolean(error)}>Go</Button></div>
				</div>
			{/if}
		</main>
	</div>

	{#if clientSecret}
		<Dialog.Root open={Boolean(clientSecret)}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Payment</Dialog.Title>
					<Dialog.Description>
						<PaymentModal onPaymentSuccess={onPaymentSuccess} onPaymentCancelled={() => console.log('Cancelled')} clientSecret={clientSecret} />
					</Dialog.Description>
				</Dialog.Header>
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{/if}

<style>
    .loader {
        width: 50px;
        aspect-ratio: 1;
        border-radius: 50%;
        background:
                radial-gradient(farthest-side,#ffa516 94%,#0000) top/8px 8px no-repeat,
                conic-gradient(#0000 30%,#ffa516);
        -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
        animation: l13 1s infinite linear;
    }
    @keyframes l13{
        100%{transform: rotate(1turn)}
    }
</style>