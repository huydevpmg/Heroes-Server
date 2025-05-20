import express from 'express';
import * as HeroController from '../controllers/hero.controller.js';
import { verifyAccessToken } from '../utils/verifyAccess.js';

const router = express.Router();

router.use(verifyAccessToken);

router.get('/', HeroController.getAllHeroes);
router.get('/owner', HeroController.getHeroesByOwner);
router.get('/:id', HeroController.getHeroById);
router.post('/', HeroController.createHero);
router.post('/many', HeroController.addManyHeroes);
router.put('/:id', HeroController.updateHero);
router.put('/:id/tags', HeroController.updateHeroTags);
router.patch('/:id/add-tag', HeroController.addTag);
router.patch('/:id/remove-tag', HeroController.removeTag);
router.delete('/:id', HeroController.deleteHero);
router.delete('/', HeroController.deleteManyHeroes);

export default router;
