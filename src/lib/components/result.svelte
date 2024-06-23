<script lang="ts">
	import type { OutputFormat } from '$lib/actions/on-payment-successed';
	import { Button } from "$lib/components/ui/button";

	type FileData = {data: string, filename: string, outputFormat: OutputFormat};
	export let filesData: FileData[] = [];

	function downloadFile(file: FileData) {
		const blob = new Blob([file.data], { type: getMimeType(file.outputFormat) });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = file.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function getMimeType(format: OutputFormat) {
		switch (format) {
			case 'json':
			case 'verbose_json':
				return 'application/json';
			case 'srt':
				return 'application/x-subrip';
			case 'vtt':
				return 'text/vtt';
			case 'text':
			default:
				return 'text/plain';
		}
	}
</script>

{#each filesData as fileData}
	<div class="flex flex-row space-x-4 items-center m-4">
		<span>{fileData.filename}</span>
		<Button on:click={() => downloadFile(fileData)}>Télécharger</Button>
	</div>
{/each}