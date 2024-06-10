export interface UseCaseInterface {
	handle(...args: any): Promise<any>
}