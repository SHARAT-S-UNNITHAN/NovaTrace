const prisma = require('../config/database');

const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: { _count: { select: { urls: true, members: true } } }
    });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
};

const createWorkspace = async (req, res) => {
  const { name, slug } = req.body;
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/ /g, '-'),
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'owner' }
        }
      }
    });
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
};

module.exports = { getWorkspaces, createWorkspace };
