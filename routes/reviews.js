const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.get('/', reviewController.getReviewsByMotel);
router.post('/', auth, reviewController.createReview);
router.get('/my-reviews', auth, reviewController.getMyReviews);
router.put('/:id', auth, reviewController.updateReview);
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;