const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', auth, reviewController.createReview);
router.get('/my-reviews', auth, reviewController.getMyReviews);

module.exports = router;