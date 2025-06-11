const express = require('express');
const router = express.Router();
const projectTypeController = require('../controllers/projectType.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/project-types', projectTypeController.getAllProjectTypes);
router.get('/project-types-with-projects', projectTypeController.getAllProjectTypesWithProjects);
router.get('/project-types/:id/projects', projectTypeController.getProjectTypeWithProjectsById);
router.post('/project-types', verifyToken, projectTypeController.createProjectType);
router.delete('/project-types/:id', verifyToken, projectTypeController.deleteProjectType);
// Các route cần bảo vệ:
router.post('/', verifyToken, projectTypeController.createProjectType);
router.delete('/:id', verifyToken, projectTypeController.deleteProjectType);
module.exports = router;