var express = require('express');
var router = express.Router();

var path = require('path');
var bodyParser = require('body-parser');

var connectionString;
var pg = require('pg');

if(process.env.DATABASE_URL) {//connecting to outside heroku database
  pg.defaults.ssl = true;
  connectionString = process.env.DATABASE_URL;
} else{//connecting to local database before being connected to heroku for testing purposes
  connectionString = 'postgress://localhost:5432/taskOrganizer';
}
//establish route for new task to be added
router.post("/addTask",function(req, res){
  var task = req.body.task;
  var completed = false;
  //establish connection with database
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
    }else{
    var taskReturn = [];
    var query = client.query('INSERT INTO task_list (task, completed) VALUES ($1, $2)' + 'RETURNING id, task, completed', [task, completed]);

    query.on('row', function(row){
     taskReturn.push(row);
    });

    query.on('end', function(){
      done();
      res.status(200).send(taskReturn);

    });

    query.on('error', function(error){
      console.log("There was a problem adding task");
      done();
      res.status(500).send(error);

    });
  }
  });//end of connection
});//end of post route

router.get("/addAllTasks", function(req, res){
  var taskList = [];
  pg.connect(connectionString, function(err, client, done){
    if(err){
      console.log('error connecting to DB:', err);
      done();
      res.status(500).send(err);

    }else{
    var query = client.query('SELECT * FROM task_List');

     //Not working at the moment
    query.on('row', function(row){
     taskList.push(row);

    });
console.log("TaskReturn variable: ", taskList);
    query.on('end', function(){
      done();
      res.send(taskList);
    });

    query.on('error', function(error){
      done();
      console.log("There was a problem adding task");
      res.status(500).send(error);
    });
  }
  });//end of connection
});

router.put('/updateTask', function(req, res){
  //establish connection with database
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
    }
    //abstract all data
    var id = req.body.id;
    var completeStatus = req.body.completed;

    var taskReturn = [];
    //run multiple querys run to update the database the other to sellect all and send back to front end
    var query = client.query('UPDATE task_list SET completed='+completeStatus+' WHERE task_list.id='+id+' RETURNING id, task, completed');
    var returnAll = client.query('SELECT * FROM task_List');

    returnAll.on('row', function(row){
     taskReturn.push(row);
    });

    query.on('end', function(){
      done();
      res.status(200);
    });
    returnAll.on('end', function(){
      done();
      res.status(200).send(taskReturn);
    });

    query.on('error', function(error){
      console.log("There was a problem adding task");
      done();
      res.status(500).send(error);

    });
    returnAll.on('error', function(error){
      console.log("There was a problem adding task");ß
      done();
      res.status(500).send(error);
    });
  });//end of connection
});


router.delete('/deleteTask', function(req, res){
  //establish connection with database
  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log('error connecting to DB:', err);
      res.status(500).send(err);
    }
    var id = req.body.id;
    var taskReturn = [];
    var query = client.query('DELETE FROM task_list WHERE task_list.id='+id+';');

    query.on('end', function(){
      done();
      res.status(200).send(taskReturn);

    });

    query.on('error', function(error){
      console.log("There was a problem adding task");
      done();
      res.status(500).send(error);

    });
  });//end of connection

});


router.get("/*", function(req, res){
  var file = req.params[0] || 'views/index.html';
  res.sendFile(path.join(__dirname, '../public' ,file));
});

module.exports = router;
