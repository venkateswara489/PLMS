import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/** Current user from DB (fresh) */
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
});

/** Update profile — persisted in MongoDB */
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { name, profile } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name != null) user.name = String(name).trim();
    if (profile && typeof profile === 'object') {
      if (profile.bio != null) user.profile.bio = String(profile.bio);
      if (Array.isArray(profile.interests)) {
        user.profile.interests = profile.interests
          .map((s) => String(s).trim())
          .filter(Boolean)
          .slice(0, 30);
      }
    }
    await user.save();
    const fresh = await User.findById(user._id).select('-password');
    return res.json({ user: fresh });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

/** Change password */
router.patch('/me/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(String(currentPassword || ''), user.password);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });
    if (String(newPassword || '').length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(String(newPassword), salt);
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;
