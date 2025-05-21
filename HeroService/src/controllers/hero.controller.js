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
    console.log(...ids);
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
    console.log(req.user);
    const updated = await HeroService.updateHeroTagsService(req.params.id, req.user.id, req.body.tags);
    if (!updated) return res.status(404).json({ message: 'Hero not found' });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const bulkAddTagController = async (req, res) => {
  const { heroIds, tag } = req.body;

  if (!Array.isArray(heroIds) || !tag)
    return res.status(400).json({ message: 'heroIds (array) and tag are required' });

  try {
    const result = await HeroService.bulkAddSingleTagToHeroesService(heroIds, tag);
    res.status(200).json({ heroIds, tag });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add tag', error: err.message });
  }
};

export const bulkRemoveTagController = async (req, res) => {
  const { heroIds, tag } = req.body;

  if (!Array.isArray(heroIds) || !tag)
    return res.status(400).json({ message: 'heroIds (array) and tag are required' });

  try {
    const result = await HeroService.bulkRemoveSingleTagFromHeroesService(heroIds, tag);
    res.status(200).json({ heroIds, tag });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove tag', error: err.message });
  }
};

export const checkEmailExists = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const exists = await HeroService.checkEmailExistsService(email);
    res.status(200).json({ exists });
  } catch (err) {
    res.status(500).json({ message: 'Error checking email', error: err.message });
  }
};