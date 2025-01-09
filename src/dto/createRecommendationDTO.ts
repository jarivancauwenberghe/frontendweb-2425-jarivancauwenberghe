// userId, movieId, reason required. Tests ensure correct types.

export interface CreateRecommendationDTO {
    userId: number;
    movieId: number;
    reason: string;
}
