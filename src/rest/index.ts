import { Express } from 'express';
import RecommendationRouter from './recommendationRouter';
import UserRouter from './userRouter';
import MovieRouter from './movieRouter';
import ReviewRouter from './reviewRouter';
import WatchlistRouter from './watchlistRouter';

const installRest = (app: Express) => {
    app.use('/recommendations', RecommendationRouter);
    app.use('/users', UserRouter);
    app.use('/movies', MovieRouter);
    app.use('/reviews', ReviewRouter);
    app.use('/watchlists', WatchlistRouter);
};

export default installRest;
















