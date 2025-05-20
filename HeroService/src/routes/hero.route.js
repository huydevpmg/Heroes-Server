import express from 'express';
import { addTag, createHero, deleteHero, deleteManyHeroes, getAllHeroes, getHeroById, getHeroesByOwner, removeTag, updateHero, updateHeroTags } from '../controllers/hero.controller.js';
import { verifyAccessToken } from '../utils/verifyAccess.js';
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

heroRouter.patch('/:id/tags/add', addTag);
heroRouter.patch('/:id/tags/remove', removeTag);

export default heroRouter;