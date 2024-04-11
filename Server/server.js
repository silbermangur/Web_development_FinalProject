const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('../Client'));

//route for register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/RegisterUser.html'));
});

//route for login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/LoginUser.html'));
});

//route for index page - which is the login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/LoginUser.html'));
});

//route for todos page
app.get('/todos', (req, res) => {
    res.sendFile(path.join(__dirname, '../Client/todos.html'));
});



const usersJsonPath = 'users.json';

//if the users.json doesn't exist - create it and initiallize with empty array (no users yet)
if (!fs.existsSync(usersJsonPath)) { 
    fs.writeFileSync(usersJsonPath, '[]', 'utf8');
}

const todosJsonPath = 'todos.json';
//if the todos.json doesn't exist - create it and initiallize with empty array (no todos yet)
if (!fs.existsSync(todosJsonPath)) {
    fs.writeFileSync(todosJsonPath, '[]', 'utf8');
}


//checks if a user exists in the database, given users array and email/username
//returns false if doesn't exist
//returns an appropriate message if exists
function userExists(users, email, username)
{
    for(let i = 0; i < users.length;i++)
    {
        if(users[i].email === email) //found by email
            return '*Error: This email already exists..';
        if(users[i].username == username) //found by username
            return '*Error: This username already exists..';
    }
    return false;//doesn't exist
}


//handles registering a user
app.post('/register', (req, res) => 
{
    try
    {
        const {user} = req.body;
        const {email, username} = user;
        //get all the users from database
        const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
        const exists = userExists(users, email, username);
        if(exists !== false) //check if the user already exists..
        {
            return res.json( {success: false, message: exists})
        }
        //user doesn't exist -> add him to database
        users.push(user);
        fs.writeFileSync(usersJsonPath, JSON.stringify(users, null, 2));
        return res.json({success: true, message: 'added'});  
    }
    catch(err)
    {
        return res.json({success: false, message: '*Error: Failed to validate/add to database..'});
    }
});


//searches for a user based on his email
//returns the user object if found
//else returns null (not found)
function findUserByEmail(users, email)
{
    for(let i = 0; i < users.length;i++)
    {
        if(users[i].email === email)
            return users[i];
    }
    return null;
}

//handles logging in validation
//check if the user exists (by email) and the password is correct
app.post('/login', (req, res) => 
{
    try
    {
        const {user} = req.body;
        const {email, password} = user;
        const users = JSON.parse(fs.readFileSync(usersJsonPath, 'utf8'));
        const searchedUser = findUserByEmail(users, email); //searches for the user
        if(searchedUser === null) //user not found
        {
            return res.json( {success: false, message: '*Error: Email not found..!'});
        }
        
        if(searchedUser.password !== password) //wrong password
        {
            return res.json( {success: false, message: '*Error: incorrect password!'});
        }
        //successful login
        return res.json({success: true, username: searchedUser.username});  
    }
    catch(err)
    {
        return res.json({success: false, message: '*Error: Failed to validate user, try again..'});
    }
});

//handles retrieving a todo list of a user based on his meail
app.get('/get_todos', (req, res) => {
    try
    {
        const email = req.query.email;
        const todos = JSON.parse(fs.readFileSync(todosJsonPath, 'utf8'));
        for(let i = 0; i < todos.length;i++)
        {
            if(todos[i].email === email) //finds the todos based on the user's email
                return res.json({success: true, todos: todos[i].todos}); //returns his todos object
        }
        return res.json({success:true, todos: []}); //didn't find any. return empty array
    }
    catch(err)
    {
        return res.json({success: false, message: '*Error: failed to get todo list.. try again'});
    }
});


//handles saving a user's todo-list to database
app.post('/save_todos', (req, res) => {
    try{
        const {email, todos} = req.body;
        const all_todos = JSON.parse(fs.readFileSync(todosJsonPath, 'utf8'));
        for(let i = 0; i < all_todos.length;i++) //check if the user already has a todos list
        {
            if(all_todos[i].email === email) //find the todos of a user by his email
            {
                all_todos[i].todos = todos; //change his todos object value
                fs.writeFileSync(todosJsonPath, JSON.stringify(all_todos, null, 2));
                return res.json({success: true}); //success
            }
        }
        //if he doesn't have a todos list - then this is the first time
        all_todos.push({email, todos});
        fs.writeFileSync(todosJsonPath, JSON.stringify(all_todos, null, 2));
        return res.json({success:true});
    }
    catch(error){
        return res.json({success: false, message: '*Error: failed to save todo list.. try again'});
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

