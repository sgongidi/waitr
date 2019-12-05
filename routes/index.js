import express from "express";

export const router = express.Router();
export const prefix = '/';
const path = require('path');

router.get('/style', (req, res) => { // style
  res.sendFile(path.resolve('site/style.css'));
});

router.get('/', (req, res) => {  // home page
  res.sendFile(path.resolve('site/index.html'));
});