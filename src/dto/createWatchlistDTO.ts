// userId, name required. movieIds optional array of integers. Tests ensure correct types and presence.

export interface CreateWatchlistDTO {
    userId: number;
    name: string;
    movieIds?: number[];
}
