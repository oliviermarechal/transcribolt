export interface StorageGatewayInterface {
	generatePresignedUrl(filename: string, contentType: string): Promise<{url: string}>;
	dropFile(filename: string): Promise<void>;
}