const express = require('express');
const router = express.Router();
const SavedJobController = require('../controllers/savedJobController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.authenticate);

router.get('/', SavedJobController.getSavedJobs);
router.post('/:jobId', SavedJobController.saveJob);
router.delete('/:jobId', SavedJobController.removeSavedJob);
router.get('/:jobId/check', SavedJobController.checkSavedJob);

module.exports = router;
