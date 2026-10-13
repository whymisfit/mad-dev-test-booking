export const ApiResponseCode = {
    Success: 'SUCCESS',
} as const;

export type ApiResponseCode = (typeof ApiResponseCode)[keyof typeof ApiResponseCode];

/**
 * WHY: Every API route answers with this envelope, both on success and on error.
 * Clients rely on the contract and read `data` without validating the body shape.
 */
export interface ApiResponse<TData> {
    code: string;
    message: string;
    data: TData;
}
