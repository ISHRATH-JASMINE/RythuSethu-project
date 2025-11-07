import express from 'express';
import ForumPost from '../models/ForumPost.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await ForumPost.find(query)
      .populate('author', 'name role profileImage location')
      .populate('comments.user', 'name role profileImage')
      .sort({ isPinned: -1, createdAt: -1 }); // Pinned posts first, then by date

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name role profileImage location')
      .populate('comments.user', 'name role profileImage');

    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', protect, async (req, res) => {
  try {
    const post = await ForumPost.create({
      author: req.user._id,
      ...req.body,
    });

    const populatedPost = await ForumPost.findById(post._id)
      .populate('author', 'name role profileImage location');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update post
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
      if (post.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      post.title = req.body.title || post.title;
      post.content = req.body.content || post.content;
      post.category = req.body.category || post.category;
      post.updatedAt = Date.now();

      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
      // Allow admin to delete any post, or author to delete their own
      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await post.deleteOne();
      res.json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pin/Unpin post (Admin only)
router.put('/:id/pin', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const post = await ForumPost.findById(req.params.id);

    if (post) {
      post.isPinned = !post.isPinned;
      await post.save();
      res.json({ message: post.isPinned ? 'Post pinned' : 'Post unpinned', isPinned: post.isPinned });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like post
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
      const alreadyLiked = post.likes.includes(req.user._id);

      if (alreadyLiked) {
        post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        post.likes.push(req.user._id);
      }

      await post.save();
      res.json({ likes: post.likes.length, liked: !alreadyLiked });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
      const comment = {
        user: req.user._id,
        content: req.body.content,
      };

      post.comments.push(comment);
      await post.save();

      const updatedPost = await ForumPost.findById(post._id)
        .populate('comments.user', 'name role profileImage');

      res.status(201).json(updatedPost.comments[updatedPost.comments.length - 1]);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete('/:postId/comment/:commentId', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);

    if (post) {
      const comment = post.comments.id(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      if (comment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      post.comments.pull(req.params.commentId);
      await post.save();

      res.json({ message: 'Comment removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
