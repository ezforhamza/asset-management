import type { ResultStatus } from "./enum";

export interface Result<T = unknown> {
	status: ResultStatus;
	message: string;
	data: T;
}

export interface PaginatedResponse<T> {
	results: T[];
	page: number;
	limit: number;
	totalPages: number;
	totalResults: number;
}
