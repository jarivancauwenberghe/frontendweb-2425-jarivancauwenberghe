import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, Check } from 'typeorm';
import { User } from './user';
import { Movie } from './movie';

@Entity()
@Check(`rating >= 1 AND rating <= 5`)
export class Review {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.reviews)
    @Index()
    user!: User;

    @ManyToOne(() => Movie, movie => movie.reviews)
    @Index()
    movie!: Movie;

    @Column({ type: 'int' })
    rating!: number;

    @Column({ type: 'text' })
    comment!: string;

    @CreateDateColumn()
    createdAt!: Date;
}

/**
 * Tests (Integration):
 * - Create a review with rating outside 1-5 (expect error at the service layer or DB constraint violation).
 * - Ensure that a Review links properly to existing User and Movie.
 * - Test deletion of associated Movie/User doesn't break Review queries if not cascaded.
 */
