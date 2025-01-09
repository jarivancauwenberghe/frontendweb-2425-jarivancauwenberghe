import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from './user';
import { Movie } from './movie';

@Entity()
export class Recommendation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.recommendations)
    @Index()
    user!: User; // Tests: Ensure valid user references. Attempt creating recommendation with invalid userId in service tests.

    @ManyToOne(() => Movie, movie => movie.recommendations)
    @Index()
    movie!: Movie; // Tests: Similarly, ensure valid movie references. Non-existent movie should cause 404 in service/controller tests.

    @Column({ type: 'text' })
    reason!: string; // Tests: Check empty reason validation in service.

    @CreateDateColumn()
    createdAt!: Date; // Tests: Verify createdAt is automatically set.
}
