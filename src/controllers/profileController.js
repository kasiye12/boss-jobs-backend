const JobSeekerProfile = require('../models/JobSeekerProfile');
const User = require('../models/User');
const uploadService = require('../services/uploadService');

class ProfileController {
  // Get profile
  static async getProfile(req, res) {
    try {
      const profile = await JobSeekerProfile.findOne({
        where: { userId: req.user.id },
        include: [{ model: User, as: 'user' }],
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found. Please create your profile.',
        });
      }

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message,
      });
    }
  }

  // Create or update profile
  static async createOrUpdateProfile(req, res) {
    try {
      const [profile, created] = await JobSeekerProfile.findOrCreate({
        where: { userId: req.user.id },
        defaults: { ...req.body, userId: req.user.id },
      });

      if (!created) {
        await profile.update(req.body);
      }

      // Check if profile is complete
      if (profile.isProfileCompleted()) {
        profile.isProfileComplete = true;
        await profile.save();
        
        // Update user profile completion date
        const user = await User.findByPk(req.user.id);
        user.profileCompletedAt = new Date();
        await user.save();
      }

      return res.status(created ? 201 : 200).json({
        success: true,
        message: created ? 'Profile created' : 'Profile updated',
        data: profile,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error saving profile',
        error: error.message,
      });
    }
  }

  // Upload voice pitch
  static async uploadVoicePitch(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded',
        });
      }

      // Upload to cloud storage
      const uploadResult = await uploadService.uploadToCloud(
        req.file.path,
        `voice/${req.user.id}/${req.file.filename}`
      );

      // Update profile
      const profile = await JobSeekerProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
        });
      }

      profile.voicePitchUrl = uploadResult.url;
      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Voice pitch uploaded successfully',
        data: { url: uploadResult.url },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading voice pitch',
        error: error.message,
      });
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file uploaded',
        });
      }

      const uploadResult = await uploadService.uploadToCloud(
        req.file.path,
        `profile/${req.user.id}/${req.file.filename}`
      );

      const profile = await JobSeekerProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
        });
      }

      profile.profilePictureUrl = uploadResult.url;
      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: { url: uploadResult.url },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading profile picture',
        error: error.message,
      });
    }
  }

  // Upload resume
  static async uploadResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file uploaded',
        });
      }

      const uploadResult = await uploadService.uploadToCloud(
        req.file.path,
        `resume/${req.user.id}/${req.file.filename}`
      );

      const profile = await JobSeekerProfile.findOne({
        where: { userId: req.user.id },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Profile not found',
        });
      }

      profile.resumeUrl = uploadResult.url;
      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: { url: uploadResult.url },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error uploading resume',
        error: error.message,
      });
    }
  }
}

module.exports = ProfileController;
