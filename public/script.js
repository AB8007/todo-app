async function registerNewUser() {
  // Haetaan käyttäjän antama käyttäjänimi ja salasana lomakkeelta
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Luodaan käyttäjä-objekti
  const user = {
    username: username,
    password: password,
  };

  try {
    // Lähetetään POST-pyyntö palvelimelle käyttäjän rekisteröintiä varten
    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    // Tarkistetaan palvelimen vastaus
    if (response.ok) {
      // Jos vastaus onnistui, tulostetaan käyttäjätiedot konsoliin
      const userData = await response.json();
      console.log(userData);
    } else {
      // Jos vastaus ei ole ok, tulostetaan virheviesti konsoliin
      const data = await response.json();
      console.error(data);
    }
    // Käsitellään mahdollinen virhe
  } catch (error) {
    console.error('Error:', error);
    alert("Käyttäjänimi on jo käytössä!");
  }
}





// darkmode

// teeman tallennus
document.addEventListener('DOMContentLoaded', function () {
  const lightModeStylesheet = document.getElementById('lightMode');
  const darkModeStylesheet = document.getElementById('darkMode');
  const darkModeToggle = document.getElementById('darkModeToggle');

  // Tarkistetaan onko talletettua teemaa local storagessa
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
      applyTheme(savedTheme);
  }

  darkModeToggle.addEventListener('click', function () {
      const currentTheme = lightModeStylesheet.disabled ? 'dark' : 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      applyTheme(newTheme);
      // Tallennetaan valittu teema local storageen
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
  // luodaan uusi LI-elementti
  let li = document.createElement('li')
    // luodaan uusi id-attribuutti
  let li_attr = document.createAttribute('id')
    // kiinnitetään tehtävän/todon id&#58;n arvo luotuun attribuuttiin 
  li_attr.value= todo._id
    // kiinnitetään attribuutti LI-elementtiin
  li.setAttributeNode(li_attr)
    // luodaan uusi tekstisolmu, joka sisältää tehtävän/todon tekstin
  let text = document.createTextNode(todo.text)
    // lisätään teksti LI-elementtiin
  li.appendChild(text)
    // luodaan uusi SPAN-elementti, käytännössä x-kirjan, jotta tehtävä saadaan poistettua
  let span = document.createElement('span')
    // luodaan uusi class-attribuutti
  let span_attr = document.createAttribute('class')
    // kiinnitetään attribuuttiin delete-arvo, ts. class="delete", jotta saadaan tyylit tähän kiinni
  span_attr.value = 'delete'
    // kiinnitetään SPAN-elementtiin yo. attribuutti
  span.setAttributeNode(span_attr)
    // luodaan tekstisolmu arvolla x
  let x = document.createElement('span')

  x.classList.add('fas', 'fa-trash-alt')
    // kiinnitetään x-tekstisolmu SPAN-elementtiin (näkyville)
  span.appendChild(x)
    // määritetään SPAN-elementin onclick-tapahtuma kutsumaan removeTodo-funkiota
  span.onclick = function() { removeTodo(todo._id) }
    // lisätään SPAN-elementti LI-elementtin
  li.appendChild(span)
    // palautetaan luotu LI-elementti
    // on siis muotoa: <li id="mongoIDXXXXX">Muista soittaa...<span class="remove">x</span></li>
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
