import Hero from '../models/hero.model.js';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export const createHeroService = async (data) => {
  const newHero = new Hero(data);
  return await newHero.save();
};

export const getAllHeroesService = async () => {
  return await Hero.find();
};

export const getHeroesByOwnerService = async (ownerId) => {
  return await Hero.find({ owner: ownerId });
};

export const getHeroByIdService = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Hero.findById(id);
};

export const updateHeroService = async (id, ownerId, data) => {
  const hero = await Hero.findOne({ _id: id, owner: ownerId });
  if (!hero) return null;

  Object.assign(hero, data);
  return await hero.save();
};

export const deleteHeroService = async (id, ownerId) => {
  return await Hero.findOneAndDelete({ _id: id, owner: ownerId });
};

export const addManyHeroesService = async (heroes, ownerId) => {
  const heroesWithOwner = heroes.map(h => ({ ...h, owner: ownerId }));
  return await Hero.insertMany(heroesWithOwner);
};

export const deleteManyHeroesService = async (ids) => {
  const objectIds = ids.map(id => new ObjectId(id));
  return await Hero.deleteMany({ _id: { $in: objectIds } });
};

export const updateHeroTagsService = async (id, ownerId, tags) => {
  const hero = await Hero.findOne({ _id: id, owner: ownerId });
  if (!hero) return null;
  hero.tags = tags;
  return await hero.save();
};

export const addTagService = async (id, tag) => {
  return await Hero.findByIdAndUpdate(id, { $addToSet: { tags: tag } }, { new: true });
};

export const removeTagService = async (id, tag) => {
  return await Hero.findByIdAndUpdate(id, { $pull: { tags: tag } }, { new: true });
};
