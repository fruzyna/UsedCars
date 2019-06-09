// imports
const express = require('express')
const fs = require('fs')
const app = express()

// file locations
const indexFile  = 'pages/index.html'
const submitFile = 'pages/tasks.html'
const tasksFile  = 'tasks.txt'
const subFile    = 'submissions.json'

// initialize home page
var indexHTML = fs.readFileSync(indexFile, 'utf8')

// initialize submit page
var tasksHTML = fs.readFileSync(submitFile, 'utf8')
var tasks = fs.readFileSync(tasksFile, 'utf8').split(/[\r\n]+/)
var tasksSection = ''
tasks.forEach(function (task, index) {
    parts = task.split(',')
    task = parts.shift()
    tasksSection += '<div class="field-wrap"><label>' + task  + '</label><select form="tasks" name="' + task + '">'
    parts.forEach(function (option, index) {
        tasksSection += '<option id="' + task + '-' + option + '">' + option + '</option>'
    })
    tasksSection += '</select></div>'
})
tasksHTML = tasksHTML.replace('{:TASKS:}', tasksSection)

// load "database"
if(fs.existsSync(subFile)) {
    var subStr = fs.readFileSync(subFile, 'utf8')
    var submissions = JSON.parse(subStr)
}
else {
    var submissions = {}
}

// respond to get request for index
app.get('/', (req, res) => {
    res.send(indexHTML)
})

// respond to get request for tasks page
app.get('/tasks', (req, res) => {
    var response = tasksHTML.slice(0)
    var plate = req.query.plate

    // if the plate has already been submitted load it in
    if(typeof submissions[plate] !== 'undefined') {
        response = response.replace('"plate">', '"plate" value="' + plate + '">')
        tasks.forEach(function (task, index) {
            task = task.split(',')[0]
            response = response.replace(submissions[plate][task] + '">', submissions[plate][task] + '" selected="selected">')
        })
    }

    res.send(response)
})

// respond to get request for submit page
app.get('/submit', (req, res) => {
    // save results to db
    var plate = req.query.plate 
    submissions[plate] = {}
    tasks.forEach(function (task, index) {
        task = task.split(',')[0]
        submissions[plate][task] = req.query[task]
    })

    // save db to file
    fs.writeFile(subFile, JSON.stringify(submissions), 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        } 
    })

    // let the user know we got their results then go home
    res.send('Submission Recieved! Page will redirect automatically. <meta http-equiv="refresh" content="3;url=/" />')
})

// start listening
app.listen(8000, () => {
    console.log('UsedCars listening on port 8000.')
})
