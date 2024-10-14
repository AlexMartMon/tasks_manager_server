import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExist } from "../middleware/project";
import { hasAuthorization, taskBelongToProject, taskExist } from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();
router.use(authenticate)

router.get("/", ProjectController.getAllProjects);

router.get("/:id",
    param('id').isMongoId().withMessage('Invalid ID.'),
    handleInputErrors,
    ProjectController.getProjectById
);

router.post(
    "/",
    body("projectName").notEmpty().withMessage("Project name must not be empty"),
    body("clientName").notEmpty().withMessage("Client name must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    handleInputErrors,
    ProjectController.postCreateProject
);

router.param('projectId', projectExist)
router.put("/:projectId",
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    body("projectName").notEmpty().withMessage("Project name must not be empty"),
    body("clientName").notEmpty().withMessage("Client name must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    hasAuthorization,
    handleInputErrors,
    ProjectController.putUpdateProject
);

router.delete("/:projectId",
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    hasAuthorization,
    handleInputErrors,
    ProjectController.deleteProject
);

/**Task's Routes */
router.post('/:projectId/tasks',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    body("name").notEmpty().withMessage("Task name must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    handleInputErrors,
    TaskController.postCreateTask
)

router.get('/:projectId/tasks',
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    handleInputErrors,
    TaskController.getProjectTasks
)

router.param('taskId', taskExist)
router.param('taskId', taskBelongToProject)
router.get('/:projectId/tasks/:taskId',
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    param('taskId').isMongoId().withMessage('Invalid ID.'),
    handleInputErrors,
    TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    param('taskId').isMongoId().withMessage('Invalid ID.'),
    body("name").notEmpty().withMessage("Task name must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    handleInputErrors,
    TaskController.putUpdateTask
)

router.delete('/:projectId/tasks/:taskId',
    hasAuthorization,
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    param('taskId').isMongoId().withMessage('Invalid ID.'),
    handleInputErrors,
    TaskController.deleteTaskById
)

router.post('/:projectId/tasks/:taskId/status',
    param('projectId').isMongoId().withMessage('Invalid ID.'),
    param('taskId').isMongoId().withMessage('Invalid ID.'),
    body("status").notEmpty().withMessage("State is mandatory"),
    handleInputErrors,
    TaskController.postUpdateStatus
)

/**Routes for teams */
router.post('/:projectId/team/find',
    body('email').isEmail().toLowerCase().withMessage('Invalid Email'),
    handleInputErrors,
    TeamController.postFindMemberById
)

router.get('/:projectId/team',
    handleInputErrors,
    TeamController.getMembers
)

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Invalid Id'),
    handleInputErrors,
    TeamController.postAddMember
)

router.delete('/:projectId/team/:userId',
    param('userId').isMongoId().withMessage('Invalid Id'),
    handleInputErrors,
    TeamController.deleteMember
)

/**Routes for Notes */

router.post('/:projectId/tasks/:taskId/notes',
    body('content').notEmpty().withMessage('Note Content is empty.'),
    handleInputErrors,
    NoteController.postCreateNote
)

router.get('/:projectId/tasks/:taskId/notes',
    handleInputErrors,
    NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:noteId',
    param('noteId').isMongoId().withMessage('Invalid Note Id.'),
    handleInputErrors,
    NoteController.deleteNote
)

export default router;
