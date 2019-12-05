import express from "express";
import {parseGet} from "../middlewares/parse_get";
import {parsePost} from "../middlewares/parse_post";
import {parseDelete} from "../middlewares/parse_delete";

export const router = express.Router();
export const prefix = '/';

const path = require('path');
const {publicStore} = require('../data/DataStore');

router.get('/vlogin', (req, res) => {  // venue login page
  res.sendFile(path.resolve('site/venue_login.html'));
});

router.get('/vsignup', (req, res) => {  // venue signup page
  res.sendFile(path.resolve('site/venue_signup.html'));
});

router.get('/*', parseGet, function (req, res) {
  const result = req.handleGet(publicStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});

router.post('/*', parsePost, function (req, res) {
  const result = req.handlePost(publicStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});

router.delete('/*', parseDelete, function (req, res) {
  const result = req.handleDelete(publicStore);
  if (typeof result !== 'undefined') {
    res.send({result})
  }
});
