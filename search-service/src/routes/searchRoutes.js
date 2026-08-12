const express = require('express');
const {authenticateRequest} = require('../middleware/authMiddleware');
const {searchPostController,getAllSearchPosts} = require('../controller/search-controller')

router = express.Router()

router.use(authenticateRequest);

router.get('/posts',searchPostController);

router.get('/all-search-posts',getAllSearchPosts);

module.exports=router;