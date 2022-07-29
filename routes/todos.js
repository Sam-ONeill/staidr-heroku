const router = require('express').Router();

let Todo = require('../models/todo.model');

router.get('/', async (req, res) => {
  const todos = await Todo.find();
  try {
    res.send(todos);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/add', async (req, res) => {
  const username = req.body.username;
  const task = req.body.task;
  const completed = false;

  const newTodo = new Todo({
    username,
    task,
    completed,
  });

  try {
    await newTodo.save();
    res.send(newTodo);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      res.status(404).send('No item found');
    }
    res.status(200).send();
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndUpdate(req.params.id, req.body);
    await Todo.save();
    res.send(todo);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
