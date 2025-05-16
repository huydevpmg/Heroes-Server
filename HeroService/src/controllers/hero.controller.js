import mongoose from "mongoose";
import Hero from "../models/hero.model.js";
import { ObjectId } from 'mongodb';

export const createHero = async (req, res) => {
    try {
        const { name, email, gender, age, address, owner } = req.body;

        const newHero = new Hero({
            name,
            email,
            gender,
            age,
            address,
            owner      
        });

        const savedHero = await newHero.save();
        res.status(201).json(savedHero);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllHeroes = async (req, res) => {
    try {
        const heroes = await Hero.find();
        res.status(200).json(heroes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHeroesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.query;
        if (!ownerId) {
            return res.status(400).json({ message: "ownerId is required" });
        }

        const heroes = await Hero.find({ owner: ownerId });
        res.status(200).json(heroes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getHeroById = async (req, res) => {
    try {
        // const { owner } = req.query;
        const heroId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(heroId)) {
            return res.status(400).json({ message: "Invalid Hero ID" });
        }
        
        const hero = await Hero.findOne({
            _id: heroId,
        });

        if (!hero) {
            return res.status(404).json({ message: "Hero not found" });
        }

        res.status(200).json(hero);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHero = async (req, res) => {
    try {
        const hero = await Hero.findOne({ _id: req.params.id, owner: req.user.id });
        if (!hero) return res.status(404).json({ message: "Hero not found" });

        const { name, email, gender, age, address } = req.body;
        hero.name = name ?? hero.name;
        hero.email = email ?? hero.email;
        hero.gender = gender ?? hero.gender;
        hero.age = age ?? hero.age;
        hero.address = address ?? hero.address;

        const updatedHero = await hero.save();
        res.status(200).json(updatedHero);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteHero = async (req, res) => {
    try {
        const hero = await Hero.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!hero) return res.status(404).json({ message: "Hero not found" });

        res.status(200).json({ message: "Hero deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addManyHeroes = async (req, res) => {
    try {
        const heroes = req.body.heroes;  
        if (!Array.isArray(heroes) || heroes.length === 0) {
            return res.status(400).json({ message: "heroes array is required" });
        }

        const heroesWithOwner = heroes.map(hero => ({
            ...hero,
            owner: req.user.id
        }));

        const savedHeroes = await Hero.insertMany(heroesWithOwner);
        res.status(201).json(savedHeroes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteManyHeroes = async (req, res) => {
    try {
        const ids = req.body.ids;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: "ids array is required" });
        }
        console.log(typeof ids[0]);
        const objectIds = ids.map(id => new ObjectId(id));

        const result = await Hero.deleteMany({
            _id: { $in: objectIds },
        });

        console.log(result);

        res.status(200).json({ message: `${result.deletedCount} heroes deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHeroTags = async (req, res) => {
  try {
    const userId = req.user.username.id;
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags must be an array" });
    }

    const hero = await Hero.findOne({ _id: id, owner: userId});
    if (!hero) {
      return res.status(404).json({ message: "Hero not found" });
    }

    hero.tags = tags;
    await hero.save();

    res.status(200).json(hero);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
