import express from 'express';
import {
    bulkAddTagController,
    bulkRemoveTagController,
    checkEmailExists,
    createHero,
    deleteHero,
    deleteManyHeroes,
    getAllHeroes,
    getHeroById,
    getHeroesByOwner,
    updateHero,
    updateHeroTags
} from '../controllers/hero.controller.js';
import { verifyAccessToken } from '../middleware/verifyAccess.js';

const heroRouter = express.Router();

heroRouter.use(verifyAccessToken);

// GET /heroes
heroRouter.get('/', getAllHeroes);

// GET /heroes/owner/:ownerId
heroRouter.get('/owner/:ownerId', getHeroesByOwner);

// GET /heroes/:id
heroRouter.get('/:id', getHeroById);

// POST /heroes
heroRouter.post('/', createHero);

// PUT /heroes/:id
heroRouter.put('/:id', updateHero);

// DELETE /heroes/:id
heroRouter.delete('/:id', deleteHero);

// DELETE /heroes (bulk delete, expects body with IDs)
heroRouter.delete('/', deleteManyHeroes);

// PATCH /heroes/:id/tags (update tags for a hero)
heroRouter.patch('/:id/tags', updateHeroTags);

// PATCH /heroes/tags/add (bulk add tags)
heroRouter.patch('/tags/add', bulkAddTagController);

// PATCH /heroes/tags/remove (bulk remove tags)
heroRouter.patch('/tags/remove', bulkRemoveTagController);

// GET /heroes/check-email?email=...
heroRouter.get('/check-email', checkEmailExists);

export default heroRouter;