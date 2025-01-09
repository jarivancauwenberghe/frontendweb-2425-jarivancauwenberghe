// Optional fields. Tests ensure that if provided, they have correct types and constraints.

export interface UpdateRecommendationDTO {
    userId?: number;
    movieId?: number;
    reason?: string;
}
