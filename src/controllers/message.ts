import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { DateTime } from 'luxon';
import { User, Message, MessageWithFormatted, UserQueries, MessageQueries } from '../db/queries';
import pool from '../db/pool';

const userQueries = new UserQueries();
const messageQueries = new MessageQueries();

export const renderMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages: Message[] = await messageQueries.getMessage();
        const userPromises = messages.map(async (message) => {
            const createdAt = DateTime.fromJSDate(message.created_at);
            const user = await userQueries.getUserById(message.user_id);

            return {
                ...message,
                formattedCreatedAt: createdAt
                    .setZone("America/New_York")
                    .toFormat("yyyy-MM-dd HH:mm"),
                first_name: user?.firstname || 'Unknown',
                last_name: user?.lastname || 'Unknown',
            };
        });

        const enrichedMessages: MessageWithFormatted[] = await Promise.all(userPromises);

        let currentUser: User | null = null;
        if (req.user && (req.user as User).id) {
            currentUser = await userQueries.getUserById((req.user as User).id);
        }

        res.render('index', {
            status: currentUser?.status || 'guest',
            messages: enrichedMessages,
        });
    } catch (error) {
        next(error);
    }
};

export const handleNewMessagePost =   [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .escape(),
    body('body')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .escape(),
  
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('newmessage', {
          errors: errors.array(),
          formInfo: req.body,
        });
      }
  
      try {
        const { title, body } = req.body;
        let user_id: number | null = null;
        if (req.user && (req.user as User).id) {
            user_id  = (req.user as User).id;
        }
        if (user_id !== null) {
            await messageQueries.addMessage(title, body, user_id);
          }
        return res.redirect('/');
      } catch (error) {
        console.error('Error during sending message:', error);
        return res.render('newmessage', {
          errors: [{ msg: 'An error occurred during sending message. Please try again.' }],
          formInfo: req.body,
        });
      }
    }
  ];

export const handleMessageDeletePost = async (req:Request, res:Response, next:NextFunction): Promise<void> => {
    const messageId = req.params.id ;
    await pool.query('DELETE FROM message WHERE id=$1',[+messageId]);
    res.redirect('/')
}