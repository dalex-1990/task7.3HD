const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
exports.createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create new post
    const newPost = new Post({
      title: req.body.title,
      content: req.body.content
    });

    // Save post
    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
exports.getAllPosts = async (req, res) => {
  try {
    // Find all posts, sort by date (most recent first)
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
exports.deletePost = async (req, res) => {
  res.status(500).send('Server error');
};

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update post
    const { title, content, image, tags } = req.body;
    
    if (title) post.title = title;
    if (content) post.content = content;
    if (image) post.image = image;
    if (tags) post.tags = tags;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server error');
  }
};