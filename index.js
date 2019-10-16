const express = require('express');

const server = express();
server.use(express.json());

const projects = [];
let count = 0;

// Middlewares
const requestCounter = (req, res, next) => {
  count++;
  console.log(`Request counter: ${count} | ${req.method} ${req.url}`);
  next();
};

const checkProjectExists = (req, res, next) => {
  const index = projects.findIndex(p => p.id === req.params.id);

  if (index == -1) {
    return res.status(404).json({
      "error": "project not found"
    });
  }

  req.projectIndex = index;

  next();
};

const checkProjectContent = (req, res, next) => {
  if (!req.body.id || !req.body.title) {
    return res.status(400).json({
      "error": `${req.body.id ? 'title' : 'id'} is required`
    });
  }

  next();
};

const checkTitleContent = (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      "error": "title is required"
    });
  }

  next();
};

server.use(requestCounter);

// Routes
server.post('/projects', checkProjectContent, (req, res) => {
  const project = req.body;
  project.tasks = [];
  project.id = String(project.id);

  projects.push(project);

  res.send(project);
});

server.post('/projects/:id/tasks', checkTitleContent, checkProjectExists, (req, res) => {
  const { projectIndex } = req;

  projects[projectIndex].tasks.push(req.body.title);

  res.send(projects[projectIndex]);
});

server.get('/projects', (req, res) => {
  res.json(projects);
});

server.put('/projects/:id', checkTitleContent, checkProjectExists, (req, res) => {
  const { projectIndex } = req;

  projects[projectIndex].title = req.body.title;
  
  res.json(projects[projectIndex]);
});

server.delete('/projects/:id', checkProjectExists, (req, res) => {
  projects.splice(req.projectIndex, 1);

  res.json(projects);
});

server.listen(3000);