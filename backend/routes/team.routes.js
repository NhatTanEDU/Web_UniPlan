const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const teamMemberController = require('../controllers/teamMember.controller');
const projectController = require('../controllers/project.controller');
const auth = require('../middleware/auth'); // Sử dụng middleware auth có sẵn

// Team routes
router.get('/statistics', auth, teamController.getTeamStatistics);
router.post('/', auth, teamController.createTeam);
router.get('/', auth, teamController.getTeams);
router.get('/:id', auth, teamController.getTeamById);
router.put('/:id', auth, teamController.updateTeam);
router.delete('/:id', auth, teamController.deleteTeam);

// Team member routes with proper URL structure
router.get('/:teamId/members', auth, teamMemberController.getTeamMembers);
router.post('/:teamId/members', auth, teamMemberController.addMemberToTeam);
router.put('/:teamId/members/:memberId', auth, teamMemberController.updateTeamMemberRole);
router.delete('/:teamId/members/:memberId', auth, teamMemberController.removeMemberFromTeam);

// Team project routes
router.get('/:teamId/projects', auth, projectController.getTeamProjects);
router.post('/:teamId/projects', auth, projectController.assignProjectToTeam);
router.delete('/:teamId/projects/:projectId', auth, projectController.removeProjectFromTeam);

// Legacy member routes (backward compatibility)
router.post('/members', auth, teamMemberController.addMember);
router.put('/members/:id', auth, teamMemberController.updateMemberRole);
router.delete('/members/:id', auth, teamMemberController.removeMember);
router.get('/members/search', auth, teamMemberController.searchUsersToAdd);

module.exports = router;