import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Review } from './review';
import { Watchlist } from './watchlist';
import { Recommendation } from './recommendation';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string; // Tests: Creating two users with same username should fail.

    @Column()
    password!: string; // Tests: In service tests, ensure password is hashed.

    @Column("simple-array")
    userRoles!: string[]; // Tests: Confirm that 'admin' and 'user' roles are handled properly. Attempt requests as user/admin.

    @OneToMany(() => Review, review => review.user)
    reviews!: Review[];

    @OneToMany(() => Watchlist, watchlist => watchlist.user)
    watchlists!: Watchlist[];

    @OneToMany(() => Recommendation, recommendation => recommendation.user)
    recommendations!: Recommendation[];
}

