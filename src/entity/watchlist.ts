import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn, Index } from 'typeorm';
import { User } from './user';
import { Movie } from './movie';

@Entity()
export class Watchlist {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.watchlists)
    @Index()
    user!: User;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @ManyToMany(() => Movie, (movie) => movie.watchlists)
    @JoinTable()
    movies!: Movie[];

    @CreateDateColumn()
    createdAt!: Date;
}
