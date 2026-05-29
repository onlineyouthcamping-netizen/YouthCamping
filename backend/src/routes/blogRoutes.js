const express = require('express');
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { validate, createBlogSchema } = require('../validators');

const router = express.Router();

router.route('/')
  .get(getBlogs)
  .post(protect, validate(createBlogSchema), createBlog);

router.route('/:id')
  .get(getBlog)
  .put(protect, updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;
