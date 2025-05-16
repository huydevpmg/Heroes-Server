import User from "../models/user.model.js";

export const getProfileByUserId = async (req, res) => {
  try {
   const { userId } = req.params; ;    
 
   console.log(userId);
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
