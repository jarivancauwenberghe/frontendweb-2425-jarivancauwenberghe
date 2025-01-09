import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, Index } from 'typeorm';
import { Review } from './review';
import { Watchlist } from './watchlist';
import { Recommendation } from './recommendation';

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Index({ unique: false }) // Change to unique: true if needed
    title!: string;

    @Column("text")
    description!: string;

    @Column()
    director!: string;

    @OneToMany(() => Review, review => review.movie)
    reviews!: Review[];

    @ManyToMany(() => Watchlist, watchlist => watchlist.movies)
    watchlists!: Watchlist[];

    @OneToMany(() => Recommendation, recommendation => recommendation.movie)
    recommendations!: Recommendation[];
}

