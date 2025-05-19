import Tag from '../models/tag.model.js';
import Hero from '../models/hero.model.js';
import { getTagStyle } from '../utils/tagStyle.util.js';

export const getTagsByUser = async (userId) => {
  const tags = await Tag.find({ owner: userId });
  return tags;
};

export const createTag = async (name, userId) => {
  if (!name) {
    throw new Error('Tag name is required');
  }   

  const existingSameUser = await Tag.findOne({ name, owner: userId });
  if (existingSameUser) {
    throw new Error('You already have a tag with this name');
  }

  const existingGlobal = await Tag.findOne({ name });
  const style = existingGlobal || getTagStyle(name);

  const newTag = new Tag({
    name,
    color: style.color,
    icon: style.icon,
    owner: userId,
  });

  const savedTag = await newTag.save();
  return savedTag;
};

export const deleteTag = async (tagId, userId) => {
  const tag = await Tag.findOneAndDelete({ _id: tagId, owner: userId });
  if (!tag) {
    throw new Error('Tag not found');
  }

  await Hero.updateMany({ owner: userId }, { $pull: { tags: tag._id } });
  return tag;
};

export const getTagStyleSuggestion = async (name) => {
  if (!name) {
    throw new Error('Tag name is required');
  }

  const existing = await Tag.findOne({ name });
  return existing
    ? { color: existing.color, icon: existing.icon }
    : getTagStyle(name);
};
