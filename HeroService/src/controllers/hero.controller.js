import * as HeroService from '../services/hero.service.js';

export const createHero = async (req, res) => {
  try {
    const savedHero = await HeroService.createHeroService(req.body);
    res.status(201).json(savedHero);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllHeroes = async (req, res) => {
  try {
    const heroes = await HeroService.getAllHeroesService();
    res.status(200).json(heroes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeroesByOwner = async (req, res) => {
  try {
    const { ownerId } = req.query;
    if (!ownerId) return res.status(400).json({ message: 'ownerId is required' });

    const heroes = await HeroService.getHeroesByOwnerService(ownerId);
    res.status(200).json(heroes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHeroById = async (req, res) => {
  try {
    const hero = await HeroService.getHeroByIdService(req.params.id);
    if (!hero) return res.status(404).json({ message: 'Hero not found' });
    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHero = async (req, res) => {
  try {
    const updated = await HeroService.updateHeroService(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Hero not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteHero = async (req, res) => {
  try {
    const deleted = await HeroService.deleteHeroService(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ message: 'Hero not found' });
    res.status(200).json({ message: 'Hero deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addManyHeroes = async (req, res) => {
  try {
    const heroes = req.body.heroes;
    if (!Array.isArray(heroes) || heroes.length === 0)
      return res.status(400).json({ message: 'heroes array is required' });

    const saved = await HeroService.addManyHeroesService(heroes, req.user.id);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteManyHeroes = async (req, res) => {
  try {
    const ids = req.body.ids;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ message: 'ids array is required' });

    const result = await HeroService.deleteManyHeroesService(ids);
    res.status(200).json({ message: `${result.deletedCount} heroes deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHeroTags = async (req, res) => {
  try {
    const updated = await HeroService.updateHeroTagsService(req.params.id, req.user.username.id, req.body.tags);
    if (!updated) return res.status(404).json({ message: 'Hero not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addTag = async (req, res) => {
  try {
    const hero = await HeroService.addTagService(req.params.id, req.body.tag);
    if (!hero) return res.status(404).json({ message: 'Hero not found' });
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add tag', error });
  }
};

export const removeTag = async (req, res) => {
  try {
    const hero = await HeroService.removeTagService(req.params.id, req.body.tag);
    if (!hero) return res.status(404).json({ message: 'Hero not found' });
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove tag', error });
  }
};
