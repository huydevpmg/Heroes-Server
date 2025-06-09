import Hero from "../models/hero.model.js";
import mongoose from "mongoose";

export const createHeroService = async (data) => {
  const newHero = new Hero(data);
  return await newHero.save();
};

export const getAllHeroesService = async () => {
  return await Hero.find();
};

export const getHeroesByOwnerService = async (ownerId) => {
  if (!mongoose.Types.ObjectId.isValid(ownerId)) {
    throw new Error("Invalid ownerId format");
  }

  const objectIdOwner = new mongoose.Types.ObjectId(ownerId);
  return await Hero.find({ owner: objectIdOwner });
};
export const getHeroByIdService = async (id) => {
  console.log(id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return await Hero.findById(id);
};

export const updateHeroService = async (id, ownerId, data) => {
  const hero = await Hero.findOne({
    _id: new mongoose.Types.ObjectId(id),
    owner: new mongoose.Types.ObjectId(ownerId),
  });
  if (!hero) {
    return null;
  }

  Object.assign(hero, data);
  return await hero.save();
};

export const deleteHeroService = async (id, ownerId) => {
  return await Hero.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(id),
    owner: new mongoose.Types.ObjectId(ownerId),
  });
};

export const addManyHeroesService = async (heroes, ownerId) => {
  const heroesWithOwner = heroes.map((h) => ({
    ...h,
    owner: new mongoose.Types.ObjectId(ownerId),
  }));
  return await Hero.insertMany(heroesWithOwner);
};

export const deleteManyHeroesService = async (ids) => {
  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  return await Hero.deleteMany({ _id: { $in: objectIds } });
};

export const updateHeroTagsService = async (id, ownerId, tags) => {
  const hero = await Hero.findOne({
    _id: new mongoose.Types.ObjectId(id),
    owner: new mongoose.Types.ObjectId(ownerId),
  });
  if (!hero) {
    return null;
  }
  hero.tags = tags;
  return await hero.save();
};

export const addTagsToManyHeroesService = async (heroIds, tags) => {
  const objectIds = heroIds.map((id) => new mongoose.Types.ObjectId(id));
  return await Hero.updateMany(
    { _id: { $in: objectIds } },
    { $addToSet: { tags: { $each: tags } } }
  );
};

export const bulkAddSingleTagToHeroesService = async (heroIds, tag) => {
  const objectIds = heroIds.map((id) => new mongoose.Types.ObjectId(id));
  return await Hero.updateMany(
    { _id: { $in: objectIds } },
    { $addToSet: { tags: tag } }
  );
};

export const bulkRemoveSingleTagFromHeroesService = async (heroIds, tag) => {
  const objectIds = heroIds.map((id) => new mongoose.Types.ObjectId(id));
  return await Hero.updateMany(
    { _id: { $in: objectIds } },
    { $pull: { tags: tag } }
  );
};
