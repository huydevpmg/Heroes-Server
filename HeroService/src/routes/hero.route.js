import express from 'express';
import {  bulkAddTagController, bulkRemoveTagController, createHero, deleteHero, deleteManyHeroes, getAllHeroes, getHeroById, getHeroesByOwner, updateHero, updateHeroTags } from '../controllers/hero.controller.js';
import { verifyAccessToken } from '../middleware/verifyAccess.js';
const heroRouter = express.Router();

heroRouter.use(verifyAccessToken);
heroRouter.get('/getAllHeroes', getAllHeroes);
heroRouter.get('/getHeroesByOwner', getHeroesByOwner);
heroRouter.get('/getHeroById/:id', getHeroById);
heroRouter.post('/createHero', createHero);
heroRouter.put('/updateHero/:id', updateHero);
heroRouter.delete('/deleteHero/:id', deleteHero);

heroRouter.delete('/bulk-delete', deleteManyHeroes);
heroRouter.put('/update-tags/:id', updateHeroTags);


heroRouter.patch('/bulk/add-tag', bulkAddTagController);
heroRouter.patch('/bulk/remove-tag', bulkRemoveTagController);


export default heroRouter;