const express = require('express');
const router = express.Router();
const teamController = require('../controllers/team.controller');
const teamMemberController = require('../controllers/teamMember.controller');
const auth = require('../middleware/auth'); // Sử dụng middleware auth có sẵn

// Team routes
router.post('/', auth, teamController.createTeam);
router.get('/', auth, teamController.getTeams);
router.get('/:id', auth, teamController.getTeamById);
router.put('/:id', auth, teamController.updateTeam);
router.delete('/:id', auth, teamController.deleteTeam);

// Team member routes
router.post('/members', auth, teamMemberController.addMember);
router.put('/members/:id', auth, teamMemberController.updateMemberRole);
router.delete('/members/:id', auth, teamMemberController.removeMember);
router.get('/members/search', auth, teamMemberController.searchUsersToAdd);

module.exports = router;