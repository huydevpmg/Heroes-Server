import User from "../models/user.model.js";

export const getProfileByUserId = async (req, res) => {
  try {
   const { userId } = req.params; ;    
 
    const profile = await User.findOne({ _id: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
      const { userId } = req.params;
    const updates = req.body;

    const profile = await User.findOneAndUpdate({ _id: userId }, updates, {
      new: true,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await User.findOne({ email });
    return res.status(200).json({ exists: !!existing });
  } catch (error) {
    console.error('Error in checkEmailExists:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};