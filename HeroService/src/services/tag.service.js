import Tag from '../models/tag.model.js';
import Hero from '../models/hero.model.js';

import mongoose from 'mongoose';

export const getTagsByUser = async (userId) => {
  return Tag.find({ owner: new mongoose.Types.ObjectId(userId) });
};

export const getTagById = async (tagId, userId) => {
  const tag = await Tag.findOne({ 
    _id: new mongoose.Types.ObjectId(tagId), 
    owner: new mongoose.Types.ObjectId(userId) 
  });
  if (!tag) {
    throw new Error('Tag not found');
  }
  return tag;
};

export const createTag = async (name, userId) => {
  if (!name) {
    throw new Error('Tag name is required');
  }

  const exists = await Tag.findOne({ 
    name, 
    owner: new mongoose.Types.ObjectId(userId) 
  });
  if (exists) {
    throw new Error('You already have a tag with this name');
  }

  const global = await Tag.findOne({ name });

  const newTag = new Tag({
    name,
    owner: new mongoose.Types.ObjectId(userId),
  });

  return newTag.save();
};

export const updateTag = async (tagId, userId, data) => {
  const { name, color, icon } = data;

  const duplicate = await Tag.findOne({
    name,
    owner: new mongoose.Types.ObjectId(userId),
    _id: { $ne: new mongoose.Types.ObjectId(tagId) },
  });

  if (duplicate) {
    throw new Error('Another tag with this name already exists');
  }

  const updated = await Tag.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(tagId), owner: new mongoose.Types.ObjectId(userId) },
    { $set: { name, color, icon } },
    { new: true },
  );

  if (!updated) {
    throw new Error('Tag not found');
  }

  return updated;
};

export const deleteTag = async (tagId, userId) => {
  const tag = await Tag.findOneAndDelete({ 
    _id: new mongoose.Types.ObjectId(tagId), 
    owner: new mongoose.Types.ObjectId(userId) 
  });
  if (!tag) {
    throw new Error('Tag not found');
  }

  await Hero.updateMany(
    { owner: new mongoose.Types.ObjectId(userId) }, 
    { $pull: { tags: tag._id } }
  );
  return tag;
};

export const checkEmailExistsService = async (email) => {
  if (!email) throw new Error('Email is required');
  const hero = await Hero.findOne({ email });
  return !!hero;
};