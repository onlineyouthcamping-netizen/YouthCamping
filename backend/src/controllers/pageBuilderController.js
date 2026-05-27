const { prisma } = require('../lib/prisma');

// Get the published version of a page layout
exports.getPublishedLayout = async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`🔍 [PageBuilder] Fetching published layout for: ${name}`);
    
    const page = await prisma.pageBuilder.findUnique({
      where: { name }
    });

    if (!page) {
      console.log(`⚠️ [PageBuilder] No record found for ${name}, returning empty defaults`);
      return res.json({ success: true, data: { sections: [] } });
    }

    res.json({ 
      success: true, 
      data: { 
        ...page,
        sections: page.sections || []
      } 
    });
  } catch (error) {
    console.error(`🔥 [PageBuilder Fetch Error] name=${req.params.name}:`, error);
    res.status(500).json({ success: false, message: "Failed to fetch published layout", error: error.message });
  }
};

exports.getDraftLayout = async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`🔍 [PageBuilder] Fetching draft layout for: ${name}`);

    const page = await prisma.pageBuilder.findUnique({
      where: { name }
    });

    if (!page) {
      console.log(`⚠️ [PageBuilder] No draft found for ${name}`);
      return res.json({ success: true, data: { sections: [] } });
    }

    res.json({ 
      success: true, 
      data: { 
        ...page,
        sections: page.draft || page.sections || []
      } 
    });
  } catch (error) {
    console.error(`🔥 [PageBuilder Draft Error] name=${req.params.name}:`, error);
    res.status(500).json({ success: false, message: "Failed to fetch draft layout", error: error.message });
  }
};

exports.updateAllSections = async (req, res) => {
  try {
    const { name } = req.params;
    const { sections } = req.body;

    if (!name) throw new Error("Page name is required");
    if (!sections || !Array.isArray(sections)) {
      console.warn(`⚠️ [PageBuilder] Invalid sections format received for ${name}`);
    }

    console.log(`💾 [PageBuilder] Updating draft for ${name} with ${sections?.length || 0} sections`);

    const page = await prisma.pageBuilder.upsert({
      where: { name },
      update: { 
        draft: sections,
        updatedAt: new Date() 
      },
      create: { 
        name, 
        draft: sections,
        sections: [] 
      }
    });

    res.json({ success: true, data: page });
  } catch (error) {
    console.error(`🔥 [PageBuilder Update Error] name=${req.params.name}:`, error);
    res.status(500).json({ success: false, message: "Failed to save draft", error: error.message });
  }
};

exports.publishLayout = async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`🚀 [PageBuilder] Publishing layout for: ${name}`);
    
    const page = await prisma.pageBuilder.findUnique({
      where: { name }
    });

    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found to publish" });
    }

    const sectionsToPublish = page.draft || [];
    
    const updatedPage = await prisma.pageBuilder.update({
      where: { name },
      data: { 
        sections: sectionsToPublish,
        updatedAt: new Date()
      }
    });

    console.log(`✅ [PageBuilder] Published ${sectionsToPublish.length} sections for ${name}`);
    res.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error(`🔥 [PageBuilder Publish Error] name=${req.params.name}:`, error);
    res.status(500).json({ success: false, message: "Failed to publish layout", error: error.message });
  }
};

// Stubs for other granular operations if needed by the UI
exports.updateSection = async (req, res) => res.json({ success: true });
exports.reorderSections = async (req, res) => res.json({ success: true });
exports.toggleSectionVisibility = async (req, res) => res.json({ success: true });
exports.duplicateSection = async (req, res) => res.json({ success: true });
