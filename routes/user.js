import express from "express";
import {parseGet} from "../middlewares/parse_get";
import {parsePost} from "../middlewares/parse_post";
import {parseDelete} from "../middlewares/parse_delete";
import {authenticateUser} from "../middlewares/auth";
import {modifyUserPath} from "../middlewares/modify_user_path";

export const router = express.Router();
export const prefix = '/user';

const {userStore} = require('../data/DataStore');

/**
 * Every request needs to be from a logged in user.
 * Modify path prefixes each request with the user's name.
 */
router.use([authenticateUser, modifyUserPath]);

router.get('/manage', (req, res) => { // send queue for venue 
  let vid = req.headers.vid;
  let queue = userStore.get(`${vid}`);
  res.send(queue);
});

router.post('/manage', (req, res) => { // update queue for venue
  let vid = req.body.vid;
  let queue = req.body.queue;
  userStore.set(`${vid}`, queue);
});

router.get('/*', parseGet, function (req, res) {
  const result = req.handleGet(userStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});

router.post('/*', parsePost, function (req, res) {
  const result = req.handlePost(userStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});

router.delete('/*', parseDelete, function (req, res) {
  const result = req.handleDelete(userStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});
