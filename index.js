//get form and list (<ul>) from the DOM:
const list = document.getElementById("task-list");
const form = document.getElementById("task-form");

class ToDoList {
  constructor(form, list) {
    this.allToDos = null;
    this.form = form;
    this.list = list;
    this.eventListeners(); //initialize a new instance of ToDoList with eventListeners on the form & the list
    this.getFromLocalStorage(); //initialize new ToDoList by getting existing tasks from localStorage
  }

  eventListeners() {
    //bind() method has to be used to prevent loosing "this"
    //When a function is used as a callback, "this" is lost, when not bound.
    this.form.addEventListener("submit", this.newToDo.bind(this));
    this.list.addEventListener("click", this.handleClick.bind(this));
  }

  getFromLocalStorage() {
    //get items (saved as "todos") from localStorage, init as empty array if there are none:
    const getTasks = JSON.parse(localStorage.getItem("todos")) || [];
    //destructure id, name and done from every task &
    //create a new instance of ToDo for every task found in localStorage:
    const tasksArray = getTasks.map(
      ({ id, name, done }) => new ToDo(id, name, done)
    );
    //set this.allToDos to the newly created array of new ToDos:
    this.allToDos = tasksArray;
    //call displayTodos() to make them visible in the UI:
    this.displayToDos();
  }

  newToDo(event) {
    event.preventDefault();
    //get the value of the input field aka the name of the new task:
    const input = document.getElementById("input-field").value;
    //create a new instance of the ToDo class by passing "null" as id, the input value as name
    //and false as the done status of the new task:
    const newTask = new ToDo(null, input, false);
    //add the new task to the array holding all tasks:
    //this.allToDos = [newTask, ...this.allToDos]; // with spread operator
    //or add new task with .push() method:
    this.allToDos.push(newTask);
    //store the new version of the allToDos array in localStorage:
    localStorage.setItem("todos", JSON.stringify(this.allToDos));
    //call getFromLocalStorage (which then calls displayToDos):
    this.getFromLocalStorage();
    //clear the event target aka the input field
    event.target.reset();
  }

  displayToDos() {
    //clear the content of the list to make sure we don't have duplicates:
    this.list.innerHTML = "";
    //iterate over the allToDos array and create an <li> for every item:
    this.allToDos.forEach((todo) => {
      const listItem = document.createElement("li");
      listItem.setAttribute("id", todo.id);
      listItem.innerHTML = `<div class="row">
      <div class="col">
        <input type="checkbox" name="mark-as-done"></input>
      </div>
      <div class="col">
        <p>${todo.name}</p>
      </div>
      <div class="col">
        <button class="btn btn-danger" name="delete">Delete</button>
      </div>
      <div class="col">
        <button class="btn btn-warning" name="edit">Edit</button>
      </div>
      </div>`;
      //Apply conditional styling depending on the done status of the task:
      if (todo.done === true) {
        listItem.children[0].style.textDecoration =
          "line-through red";
        listItem.children[0].children[0].children[0].setAttribute(
          "checked",
          "true"
        );
      }
      //append the <li> to the list at the end of every iteration
      this.list.appendChild(listItem);
    });
  }

  handleClick(event) {
    //get the ID of the task that should be deleted / updated:
    const idOfTask =
      event.target.parentNode.parentNode.parentNode.getAttribute(
        "id"
      );
    //check where the specific task was clicked based on the "name" attribute and
    //forward the event to the respective eventHandler:
    if (event.target.name === "delete") {
      this.deleteTask(idOfTask);
    } else if (event.target.name === "edit") {
      this.editTask(event, idOfTask);
    } else if (event.target.name === "mark-as-done") {
      this.markAsDone(idOfTask);
    }
  }
  deleteTask(id) {
    //get index of the task to delete thanks to the id passed as argument:
    const indexOfItemToDelete = this.allToDos.findIndex(
      (task) => task.id == id
    );
    //Remove one item at the given index from the allToDos array:
    this.allToDos.splice(indexOfItemToDelete, 1);
    //store the new version of the allToDos array in localStorage:
    localStorage.setItem("todos", JSON.stringify(this.allToDos));
    //call getFromLocalStorage (which then calls displayToDos):
    this.getFromLocalStorage();
  }

  editTask(event, id) {
    //get the p-tag of the task to edit
    const paragraph =
      event.target.parentNode.parentNode.children[1].childNodes[1];
    //create and append input field and done-icon
    const newInputField = document.createElement("input");
    newInputField.setAttribute("type", "text");
    newInputField.setAttribute("id", "edit-input");
    const doneButton = document.createElement("i");
    doneButton.setAttribute("class", "bi bi-check-square");
    doneButton.setAttribute("style", "font-size: 1.5rem");
    paragraph.appendChild(newInputField);
    paragraph.appendChild(doneButton);
    //EventHandler for when the done-icon is clicked
    //replaces the current task in the allToDos Array with a new ToDo instance
    const replaceTask = (event) => {
      //find Index of the Item to edit:  
      const IndexOfTaskToEdit = this.allToDos.findIndex(
        (task) => task.id == id
      );
      //remove one item at the given index and replace with a new instance of ToDo:
      this.allToDos.splice(
        IndexOfTaskToEdit,
        1,
        new ToDo(id, event.target.previousSibling.value, false)
      );
      //store the new version of the allToDos array in localStorage:
      localStorage.setItem("todos", JSON.stringify(this.allToDos));
      //call getFromLocalStorage (which then calls displayToDos):
      this.getFromLocalStorage();
    };
    //EventListener for done-icon:
    doneButton.addEventListener("click", replaceTask);
  }

  markAsDone(id) {
    //get the <li> element of the task that should be toggled:  
    const task = document.getElementById(id);
    //apply styling based on the current styling:
    if (task.style.textDecoration === "line-through red") {
      task.style.textDecoration = "none";
    } else {
      task.style.textDecoration = "line-through red";
    }
    //get the index of the task that should be toggled:
    const indexOfTaskToComplete = this.allToDos.findIndex(
      (task) => task.id == id
    );
    //toggle the status of the task in the array:
    if (this.allToDos[indexOfTaskToComplete].done == false) {
      this.allToDos[indexOfTaskToComplete].done = true;
    } else {
      this.allToDos[indexOfTaskToComplete].done = false;
    }
    //store the new version of the allToDos array in localStorage:
    localStorage.setItem("todos", JSON.stringify(this.allToDos));
     //call getFromLocalStorage (which then calls displayToDos):
    this.getFromLocalStorage();
  }
}

class ToDo {
  constructor(id, name, done) {
    this.id = id || Date.now(); //set the task's id to the id passed as argument or to the current timestamp if there is none
    this.name = name;
    this.done = done;
  }
}

//Instantiate new To Do List and pass the form and the <ul>:
const myList = new ToDoList(form, list);
