import express from "express";
import {parseGet} from "../middlewares/parse_get";
import {parsePost} from "../middlewares/parse_post";
import {parseDelete} from "../middlewares/parse_delete";

export const router = express.Router();
export const prefix = '/';

const path = require('path');
const {publicStore} = require('../data/DataStore');
const {privateStore} = require('../data/DataStore');
const {accountStore} = require('../data/DataStore');

router.get('/', (req, res) => {  // home page
  res.sendFile(path.resolve('site/index.html'));
});

router.get('/queue', (req, res) => {  // queue page
  res.sendFile(path.resolve('site/customer_queue.html'));
});

router.get('/style', (req, res) => { // style
  res.sendFile(path.resolve('site/style.css'));
});

router.get('/scripts', (req, res) => { // scripts
  res.sendFile(path.resolve('site/scripts.js'));
});

router.get('/vlogin', (req, res) => {  // venue login page
  res.sendFile(path.resolve('site/venue_login.html'));
});

router.get('/manage', (req, res) => {
  res.sendFile(path.resolve('site/venue_manage.html'));
});

router.get('/vsignup', (req, res) => {  // venue signup page
  res.sendFile(path.resolve('site/venue_signup.html'));
});

router.get('/venues/:vid', (req, res) => {
  let venues = publicStore.get('venues');
  if(venues.includes(req.params['vid'])){
    res.sendFile(path.resolve('site/customer_queue.html'));
  } else {
    res.status(404).send({msg: "Venue not found"});
  }
});

router.post('venues/:vid', (req, res) => {
  let name = req.body.name;
  let ven = req.params['vid'];
  let accts = accountStore.get('Users');
  let vid;

  for (let acct in accts) {
    if(acct.data.venue === ven) {
      vid = acct.data.vid;
    }
  }
  let queue = privateStore.get(`${vid}`);
  queue.push(name);
  privateStore.set(`${vid}`, queue);
});

router.get('/venues', (req, res) => {
  res.send(publicStore.get('venues'));
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
