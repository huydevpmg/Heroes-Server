import express from 'express';
import { checkEmailExists, getProfileByUserId, updateProfile, getAllUsers } from '../controllers/profile.controller.js';

const profileRoute = express.Router();

profileRoute.get('/check-email', checkEmailExists);
profileRoute.get('/:userId', getProfileByUserId);                      
profileRoute.put('/:userId', updateProfile);                           
profileRoute.get('', getAllUsers);

export default profileRoute;
