import { Router } from 'express';
import { queries } from '@global/constants.js';
import { allowedMenusSchema } from '@schemas/db/index.js';
import { session, db, logger } from '@components/index.js';

const router = Router();

/**
 * @swagger
 * /auth/user/menu:
 *  get:
 *    tags:
 *      - auth
 *    description: Gets the list of menus the user can access.
 *    responses:
 *      200:
 *        description: List of menus the user can access.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: string
 *                example: "Dashboard"
 *      401:
 *        description: User is not logged in.
 */
router.get('/user/menu', async (req, res) => {
  const userSession = await session.get(req);

  if (!userSession) {
    return res.status(401).json({ message: 'User is not logged in.' });
  }

  try {
    const menusResult = await db.fetch(
      queries.user.getAllowedMenus,
      allowedMenusSchema,
      [userSession.userId]
    );

    const menus = menusResult.map(menu => menu.menuName);

    return res.status(200).json(menus);
  } catch (err) {
    logger.error(`Error getting user menus: ${err}`);
    return res.status(500).json({ message: 'A server error occurred.' });
  }
});

export default router;