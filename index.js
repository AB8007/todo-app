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

// Yhdistetään tietokantaan

mongoose.connect('mongodb+srv://ab8007:eWQoH2Df7z3GIZSz@todocluster.bx8hqpl.mongodb.net/todo_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

var db = mongoose.connection;

// Tarkistetaan yhteys

db.on('error', () => console.log("error in connecting database"));
db.once('open', () => console.log("Connected to Database"));

// Reitti, joka ohjaa kirjautumaan
app.get("/", (req, res) => {

    res.set({
        "Allow-access-Allow-Origin": '*'
    })

    return res.redirect('index.html');

})

// Reitti käyttäjänimen hakemiselle, sillä nimeä ei ole suoraan URL:ssa
app.get("/getUserInfo", async (req, res) => {
  const userId = req.query.userId;
  const user = await db.collection('users').findOne({ userID: userId });

  if (!user) {
    res.status(404).json({ error: "User not found" });
  } else {
    res.json({ name: user.name });
  }
});


app.listen(port, () => {
  console.log('Example app listening on port 3000')
});

// Reitit

app.post("/login", async (request, response) => {
    try {
      // Haetaan käyttäjän antamat käyttäjänimi ja salasana pyynnöstä
        const username = request.body.username;
        const password = request.body.password;

        // Etsitään käyttäjä tietokannasta käyttäjänimen perusteella
        const user = await db.collection('users').findOne({ name: username });

        if (!user) {
            response.send("Käyttäjää tällä nimellä ei ole olemassa!");
        } else {
          // Vertaillaan annettua salasanaa käyttäjän tietokannassa olevaan salasanaan
            if (user.password === password) {
              // Jos salasanat täsmäävät, ohjataan käyttäjä eteenpäin home.html-sivulle käyttäjän ID:n kanssa
                response.redirect('home.html?user=' + user.userID);
            } else {
              // Jos salasanat eivät täsmää, lähetetään virheviesti
                response.send("Väärä salasana!");
            }
        }
    } catch (error) {
        response.send("Käyttäjänimi ja salasana eivät täsmää!");
    }
});


// Uuden käyttäjän rekisteröinti

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

// Signup reitti
app.post("/signup", async (request, response) => {

    // Määritetään vakiot käyttäjänimelle ja salasanalle body-elementistä
    const username = request.body.username;
    const password = request.body.password;

    // Vaaditaan käyttäjältä molemmat tiedot
    if (!username || !password) {
      return response.status(400).json({ error: "Ole hyvä ja syötä molemmat tiedot." });
    }

    // Määritetään vakio user
    const user ={
      name: request.body.username,
      password: request.body.password,
      userID: uuidv4(),
    }
  
    // Tarkistetaan, ettei käyttäjää ole jo olemassa
    const alreadyUser = await Signup.findOne({name: user.name});
  
    // Tulostetaan virhe tai lisätään käyttäjä tietokantaan
    if(alreadyUser) {
      response.send("Käyttäjä on jo olemassa! Kokeile eri käyttäjänimeä.");
    } else {
    
      const userData = await Signup.insertMany(user);
      console.log(userData);
    }
  })

// todo schema
const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userID: { type: String, required: true }
})

// model
const Todo = mongoose.model('Todo', todoSchema, 'todos')

// Routes here...

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