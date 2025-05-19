import * as TagService from '../services/tag.service.js'

export const getTags = async (req, res) => {
  try {
    const tags = await TagService.getTagsByUser(req.user.id);
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTag = async (req, res) => {
  const { name } = req.body;

  try {
    const tag = await TagService.createTag(name, req.user.id);
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const tag = await TagService.deleteTag(req.params.id, req.user.id);
    res.json({ message: 'Tag deleted successfully', tag });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getTagStyle = async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ message: 'Missing tag name' });

  try {
    const style = await TagService.getTagStyleSuggestion(name);
    res.json(style);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
