// Function for handling user registration
async function registerNewUser() {
  // Requesting given information from the element
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Defining "user" object
  const user = {
    username: username,
    password: password,
  };

  try {
    // POST request to add the new user
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    // Tarkistetaan palvelimen vastaus
    if (response.ok) {
      // ...
      const userData = await response.json();
    } else {
      // ...
      const data = await response.json();
      console.error(data);
    }
    // Error handling
  } catch (error) {
    console.error('Error:', error);
    alert("Käyttäjänimi on jo käytössä!");
  }
}





// Darkmode function

document.addEventListener('DOMContentLoaded', function () {
  const lightModeStylesheet = document.getElementById('lightMode');
  const darkModeStylesheet = document.getElementById('darkMode');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Checking for saved theme in the local storage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
      applyTheme(savedTheme);
  }

  // Adding event listener for the button clicks, clicking the button changes the value
  darkModeToggle.addEventListener('click', function () {
      const currentTheme = lightModeStylesheet.disabled ? 'dark' : 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      applyTheme(newTheme);
      
      localStorage.setItem('theme', newTheme);
  });

  function applyTheme(theme) {
      if (theme === 'dark') {
          lightModeStylesheet.setAttribute('disabled', true);
          darkModeStylesheet.removeAttribute('disabled');
      } else {
          darkModeStylesheet.setAttribute('disabled', true);
          lightModeStylesheet.removeAttribute('disabled');
      }
  }
});

function init() {
  let infoText = document.getElementById('infoText')
  infoText.innerHTML = 'Ladataan tehtävälista palvelimelta, odota...'
  loadTodos()
}

async function loadTodos() {
  const address = window.location.search;
  const params = new URLSearchParams(address)
  const userID = params.get('user')
  console.log(userID)  

  let response = await fetch('http://localhost:3000/todosAdd/'+userID)
  
  let todos = await response.json()
    console.log(todos)
  showTodos(todos)
}

function createTodoListItem(todo) {

  let li = document.createElement('li')

  let li_attr = document.createAttribute('id')

  li_attr.value= todo._id

  li.setAttributeNode(li_attr)

  let text = document.createTextNode(todo.text)

  li.appendChild(text)

  let span = document.createElement('span')

  let span_attr = document.createAttribute('class')

  span_attr.value = 'delete'

  span.setAttributeNode(span_attr)

  let x = document.createElement('span')

  x.classList.add('fas', 'fa-trash-alt')

  span.appendChild(x)

  span.onclick = function() { removeTodo(todo._id) }

  li.appendChild(span)

  return li
}

function showTodos(todos) {
  let todosList = document.getElementById('todosList')
  let infoText = document.getElementById('infoText')
  // no todos
  if (todos.length === 0) {
    infoText.innerHTML = 'Ei tehtäviä, aloita lisäämällä uusi tehtävä!'
  } else {    
    todos.forEach(todo => {
        let li = createTodoListItem(todo)        
        todosList.appendChild(li)
    })
    infoText.innerHTML = ''
  }
}

async function addTodo() {
  let newTodo = document.getElementById('newTodo')

  if (newTodo.value === "") {
    infoText.innerHTML = "Tyhjää tehtävää ei voi lisätä!"
  } else {

    const address = window.location.search;
    const params = new URLSearchParams(address)
    const userID = params.get('user') 

    const data = { 'text': newTodo.value, 'userID': userID }
    const response = await fetch('http://localhost:3000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
  let todo = await response.json()
  let todosList = document.getElementById('todosList')
  let li = createTodoListItem(todo)
  todosList.appendChild(li)

  let infoText = document.getElementById('infoText')
  infoText.innerHTML = ''
  newTodo.value = ''
}
}

async function removeTodo(id) {
  const response = await fetch('http://localhost:3000/todos/'+id, {
    method: 'DELETE'
  })
  let responseJson = await response.json()
  let li = document.getElementById(id)
  li.parentNode.removeChild(li)

  let todosList = document.getElementById('todosList')
  if (!todosList.hasChildNodes()) {
    let infoText = document.getElementById('infoText')
    infoText.innerHTML = 'Ei tehtäviä, aloita lisäämällä uusi tehtävä!'
  }
}

function clickButton(){
  const address = window.location.search;
  const params = new URLSearchParams(address)
  const userID = params.get('user')

  window.location.href = 'sovellus.html?user='+userID
}

async function getUsername() {
  const address = window.location.search
  const params = new URLSearchParams(address)
  const userID = params.get('user')

  const response = await fetch(`/getUserInfo?userId=${userID}`)
  const userData = await response.json()

  const username = userData.name

  const headerSmall = document.querySelector('.headerSmall h1')
  headerSmall.textContent = `Tervetuloa, ${username}!`
}

document.addEventListener('DOMContentLoaded', function() {
  getUsername();
});
