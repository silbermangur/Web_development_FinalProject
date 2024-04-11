// grab all elements 
const form = document.querySelector("[data-form]");//By Attribute
const lists = document.querySelector("[data-lists]");
const input = document.querySelector("[data-input]");

const saveResult = document.getElementById('saveResult');

//--keep array Global fo UI variable fo UI Display
let todoArr = [];

//get current logged-in user details
const username = sessionStorage.getItem('username');
const email = sessionStorage.getItem('email');

//check if there isn't any logged in user currently
if(!username || !email)
    window.location.href = 'login'; //navigate to login

//inserts user's email & username into the DOM for display
function load_user_details()
{
    document.getElementById('username').textContent = username;
    document.getElementById('email').textContent = email;
}

//once the browser is loaded
window.addEventListener("DOMContentLoaded", () => {
    load_user_details();
    //-When Page Loaded Get All Items from DataBase storage
     Storage.getStorage()
     .then(todoRes => {
        
        todoArr = todoRes;
        //--Display Data According Loaded Array
        UI.displayData();
        //register remove from the dom
        
     })
     .catch(error => {
        lists.innerHTML = `<span>${error}</span>`;
     });
     UI.registerRemoveTodo();
});


///--ToDo Class: Each Visual Element Should be 
//--related to ToDO Object
class Todo {
    constructor(id, todo){
        this.id = id;
        this.todo = todo;
    }
}


//function to save changes (added/deleted todos) to database
function saveChanges() 
{
    Storage.addTodStorage(todoArr);
}

//--Class To handle Storage Operations
//-- Of todo array
class Storage
{
    //Get Array Of Class Objects 
    static addTodStorage(todoArr){

        const data = {email: sessionStorage.getItem('email'), todos : todoArr}
        //sends request to server to save the changes in the todo-list
        fetch('save_todos', 
        {
            method:'POST', 
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            return response.json();
        })
        .then(data => {
            if(data.success === true)
            {
                //displays success message that save was successful!
                saveResult.textContent = 'Successfully saved todo-list in database!';
                saveResult.style.color = 'blue';
                saveResult.style.display = 'block';
            }
            else{
                //displays error message that save has failed
                saveResult.textContent = "Failed to save changes to database.. try again";
                saveResult.style.color = 'red';
                saveResult.style.display = 'block';
            }
        })
        .catch(error => {
            //displays error message that save has failed
            saveResult.textContent = "Failed to save changes to database.. try again";
            saveResult.style.color = 'red';
            saveResult.style.display = 'block';
        });
    }

    //Get From DataBase By Email
    //now returns a promise
    static getStorage(){
        return new Promise((resolve, reject) => {
            const email = sessionStorage.getItem('email');
            fetch(`/get_todos?email=${email}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if(data.success === true) //successfully retrieved the todo-list 
                {
                    let storage = data.todos;
                    resolve(storage); //returns the retrieved list
                }
                else
                {
                    reject(data.message);
                }
            })
            .catch(error => {
                reject('*Error: Unexpected error.. Try again!');
            });
        });
    }
}


//Submit
form.addEventListener("submit", (e) => {
     //Disble continue sumit processing...
    e.preventDefault();
    //Create New Object By User Input
    let id = Math.random() * 1000000;
    const todo = new Todo(id, input.value);
   // todoArr.push(todo);
    todoArr = [...todoArr,todo];
  
    UI.displayData();
    UI.clearInput();
    saveResult.style.display = 'none';
});

//Handle UI Operation 
class UI{

    //--Go Over All Array Elements 
    //--And Generate HTML Items Dynamically
    static displayData(){
        
        //-Generate Html
        //-each Delete Icon Injected with 
        //--data-id = {id of the object}
        
        let displayData = todoArr.map((item) => {
            return `
                <div class="todo">
                <p>${item.todo}</p>
                <span class="remove" style="font-size:30px;width:20px;" data-id = ${item.id}>&#128465;</span>
                </div>
            `
        });
        //--Put generated html in a container
        if(todoArr.length === 0) //if the list is empty -> display a message
            lists.innerHTML = "<span>You don't have any todos currently.. start adding!</span>";
        else
            lists.innerHTML = (displayData).join(" ");
        
    }
   
    //--Clear Input Element
    static clearInput(){
       
        input.value = "";
    }

    //--Remove Element When Clicked
    static registerRemoveTodo(){
        //--Register Click  For Deleting a toto row
        //--The Click is on the List Div Container

        lists.addEventListener("click", (e) => {
            if(e.target.classList.contains("remove")){
                //Get Id of clicked delete
                let btnId = e.target.dataset.id;
                //--Remove Element From HTML DOM
                
                //remove from array.
                UI.removeArrayTodo(btnId, e.target);

            }
        
        });
    }
   
   //Remove Element From UI And Update LocalStorage
    static removeArrayTodo(id,elementClicked){
        
        elementClicked.parentElement.remove();
        todoArr = todoArr.filter((item) => item.id !== +id);
        if(todoArr.length === 0)//if the list is empty -> display a message
            lists.innerHTML = "<span>You don't have any todos currently.. start adding!</span>";
        saveResult.style.display = 'none';
    }
}




