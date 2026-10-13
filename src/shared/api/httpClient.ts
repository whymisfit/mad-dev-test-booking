import axios from 'axios';

import { Environment } from '@/shared/configs/Environment';

import { ApiError } from './ApiError';
import type { ApiResponse } from './ApiResponse';

export const httpClient = axios.create({
    baseURL: `${Environment.apiUrl}/api`,
    headers: {
        'content-type': 'application/json',
    },
});

httpClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError<ApiResponse<null>>(error) && error.response) {
            const { status, data } = error.response;

            return Promise.reject(new ApiError(data.message, status, data.code));
        }

        return Promise.reject(error);
    },
);
