import express from 'express';
import { controlSignUpPost, controlLoginPost, isAuthenticated } from '../controllers/authentication';
import { renderMessage, handleNewMessagePost } from '../controllers/message'
const router = express.Router();

router.get('/', isAuthenticated, renderMessage);


router.get('/register', (req, res, next) => {
  res.render('register', {
    errors: [],
    formInfo: {},
  });
})

router.post('/register', controlSignUpPost);

router.get('/login', (req, res, next) => {
  if(req.isAuthenticated()){
    res.redirect('/')
  }
  res.render('login', {
    errors: [],
    formInfo: {}
  });
})

router.post('/login', controlLoginPost);

router.post('/logout', (req, res, next) => {
  req.logout((err) => { 
    if (err) { 
      return next(err); 
    }
    res.redirect('/login'); 
  });
});

router.get('/newmember', (req, res, next) => {
  res.render('newmember');
})

router.get('/newadmin', (req, res, next) => {
  res.render('newadmin');
})

router.get('/newmessage', (req, res, next) => {
  if(!req.isAuthenticated()){
    res.redirect('/login')
  }
  res.render('newmessage', {
    errors: [],
    formInfo: {}
  });
})

router.post('/newmessage', handleNewMessagePost)

export default router