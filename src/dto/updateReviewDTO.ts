// Optional fields. Tests ensure that if provided, they have correct types and constraints.
export interface UpdateReviewDTO {
    userId?: number;
    movieId?: number;
    rating?: number;
    comment?: string;
}
