import express from 'express';
import { getProfileByUserId, updateProfile } from '../controllers/profile.controller.js';

const profileRoute = express.Router();

profileRoute.get('/:userId', getProfileByUserId);                      
profileRoute.put('/:userId', updateProfile);                           

export default profileRoute;
