import { errorCatcher } from '@/middleware/error-middleware.js';
import { Router } from 'express';
import * as UserController from '@/users/controller.js';
// import { isAdmin, isAuthenticated } from '@/middleware/privilage.js';

const router = Router();

router
  .route('/')
  // .all(errorCatcher(isAuthenticated), errorCatcher(isAdmin))
  .post(UserController.httpCreateUsers)
  .get(errorCatcher(UserController.httpGetAllUsers));

// router.delete(
//   '/delete-wrong-passwords',
//   errorCatcher(UserController.httpDeleteWrongPassTrials)
// );
router
  .route('/:id')
  // .all(errorCatcher(isAuthenticated), errorCatcher(isAdmin))
  .get(errorCatcher(UserController.httpGetUser))
  .put(UserController.httpUpdateUser)
  .delete(errorCatcher(UserController.httpDeleteUser));

router
  .route('/check/:id')
  .get(UserController.httpCheckQRCode);
export { router as userRouter };
