const express = require("express");
const cors = require('cors');
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const app = express()
const port = 3000
const { v4: uuidv4 } = require("uuid")

app.use(cors())

app.use(bodyParse.json())
app.use(express.static('public'))
app.use(bodyParse.urlencoded({
    extended: true
}))

// Connecting to database

mongoose.connect('mongodb+srv://ab8007:eWQoH2Df7z3GIZSz@todocluster.bx8hqpl.mongodb.net/todo_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.listen(port, () => {
  console.log('Example app listening on port 3000')
});

var db = mongoose.connection;

// Checking connection
db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));

// Route to index page with login view
app.get("/", (req, res) => {

    res.set({
        "Allow-access-Allow-Origin": '*'
    })

    return res.redirect('index.html');

})

// Route for getting the username to display it in the app
app.get("/getUserInfo", async (req, res) => {
  const userId = req.query.userId;
  const user = await db.collection('users').findOne({ userID: userId });

  if (!user) {
    res.status(404).json({ error: "User not found" });
  } else {
    res.json({ name: user.name });
  }
});


app.post("/login", async (request, response) => {
    try {
      // Requesting username and password from the body element of the page
        const username = request.body.username;
        const password = request.body.password;

        // Searching for the user with username from the database
        const user = await db.collection('users').findOne({ name: username });
        // Display error message if the user doesn't exist
        if (!user) {
            response.send("Käyttäjää tällä nimellä ei ole olemassa!");
        } else {
          // Compare the input password to the one found in the database
            if (user.password === password) {
              // If the password matches, redirect the user

              // NOTE

              // Using uuID in the url to redirect users is intentionally bad design choice from security point of view. 
              // Due to the nature of the project I am keeping things simple.

                response.redirect('home.html?user=' + user.userID);
            } else {
                response.send("Käyttäjänimi ja salasana eivät täsmää!");
            }
        }
    } catch (error) {
        response.send("Käyttäjänimi ja salasana eivät täsmää!");
    }
});


// Schema and model for registering a new user

const loginSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userID: {
      type: String,
      required: true,
      unique: true,
    }
  })
  
const Signup = mongoose.model("users", loginSchema);

// Route for signup
app.post("/signup", async (request, response) => {

    // Requesting the signup information from the body element
    const username = request.body.username;
    const password = request.body.password;

    // Ensure the required information is given.
    if (!username || !password) {
      return response.status(400).json({ error: "Ole hyvä ja syötä molemmat tiedot." });
    }

    const user ={
      name: request.body.username,
      password: request.body.password,
      userID: uuidv4(),
    }
  
    // Checking if user already exists
    const alreadyUser = await Signup.findOne({name: user.name});
  
    // Adding the new user to the database
    if(alreadyUser) {
      response.send("Käyttäjä on jo olemassa! Kokeile eri käyttäjänimeä.");
    } else {
    
      const userData = await Signup.insertMany(user);
      console.log(userData);
    }
  })

// Schema and model for adding a new todo entry
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userID: { type: String, required: true }
})

const Todo = mongoose.model('Todo', todoSchema, 'todos')

// Route for adding a new todo entry

app.post('/todos', async (request, response) => {
  const { text, userID } = request.body
  const todo = new Todo({
    text: text,
    userID: userID
  })
  const savedTodo = await todo.save()
  response.json(savedTodo)  
})

// todos-route

app.get('/todos', async (request, response) => {    
  const userID = request.query
  const todos = await Todo.find({userID: userID})
  response.json(todos)
})

app.get('/todos/:id', async (request, response) => {
const todo = await Todo.findById(request.params.id)
if (todo) response.json(todo)
else response.status(404).end()
})

app.delete('/todos/:id', async (request, response) => {
const deletedTodo = await Todo.findOneAndDelete({ _id: request.params.id });
if (deletedTodo) response.json(deletedTodo)
else response.status(404).end()
})

app.get('/todosAdd/:id', async (request, response) => {
  const todos = await Todo.find({ userID: request.params.id });
  response.json(todos)
})