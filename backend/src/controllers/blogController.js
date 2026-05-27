const { prisma } = require('../lib/prisma');

exports.getBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { tenantId: req.user?.tenantId || 'default', isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: blogs });
  } catch (error) {
    next(error);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { 
        OR: [ { id: req.params.id }, { slug: req.params.id } ],
        tenantId: req.user?.tenantId || 'default'
      }
    });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};
/**
 * @desc    Create blog
 * @route   POST /api/blogs
 */
const slugify = require('slugify');

exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, image, author, authorImage, status, readTime, hasVideo, slug } = req.body;
    
    // Generate slug if not provided
    const finalSlug = slug || slugify(title || 'untitled', { lower: true, strict: true });

    const blog = await prisma.blog.create({
      data: { 
        title: title || "Untitled Story",
        content: content || "",
        image: image || null,
        author: author || "Expedition Team",
        authorImage: authorImage || null,
        status: status || "draft",
        readTime: readTime || "5 MIN READ",
        hasVideo: !!hasVideo,
        slug: finalSlug,
        tenantId: req.user?.tenantId || 'default'
      }
    });
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    // Check for unique constraint violation (P2002)
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A blog with this title/slug already exists' });
    }
    next(error);
  }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 */
exports.updateBlog = async (req, res, next) => {
  try {
    const { title, content, image, author, authorImage, status, readTime, hasVideo, slug } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (image !== undefined) updateData.image = image;
    if (author !== undefined) updateData.author = author;
    if (authorImage !== undefined) updateData.authorImage = authorImage;
    if (status !== undefined) updateData.status = status;
    if (readTime !== undefined) updateData.readTime = readTime;
    if (hasVideo !== undefined) updateData.hasVideo = !!hasVideo;
    if (slug !== undefined) updateData.slug = slug;

    const blog = await prisma.blog.updateMany({
      where: { id: req.params.id, tenantId: req.user?.tenantId || 'default' },
      data: updateData
    });
    if (blog.count === 0) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog updated' });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'A blog with this title/slug already exists' });
    }
    next(error);
  }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 */
exports.deleteBlog = async (req, res, next) => {
  try {
    const result = await prisma.blog.deleteMany({
      where: { id: req.params.id, tenantId: req.user?.tenantId || 'default' }
    });
    if (result.count === 0) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    next(error);
  }
};
