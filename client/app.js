var newTaskObject = {};
//document ready
$(document).ready(function(){
  //load all tasks that are currently in database
  getAllTasks();
  //add event listeners for submit, complete and delete
  $('#addTask').on('submit', submitTaskButton);
  $('.container').on('click', '.complete', completeTask);
  $('.container').on('click', '.delete', deleteTask);
});
//funciton to handle submit request
function submitTaskButton(event){
  //prevenet default
  event.preventDefault();

  var taskArray = $('#addTask').serializeArray();
  //grab information off the form
  $.each(taskArray, function(index, element){
    newTaskObject[element.name] = element.value;
  });

  //start ajax call to post to database
  $.ajax({
    type: 'POST',
    url: '/addTask',
    data: newTaskObject,
    success: getAllTasks//send back all tasks and load them on the DOM
  });//end of ajax call
}
//function to get all tasks from the database
function getAllTasks(){
  //start of ajax call to make the request to get all tasks
  $.ajax({
    type: 'GET',
    url: '/addAllTasks',
    success: loadTasks//load tasks to the database
  });//end of ajax call
}
//load function that takes in the response from the server and appends them to the DOM
function loadTasks(response){
  //empty out container and reappend all info
  $('.container').empty();
  $('.container').append('<h2>Current Tasks</h2>');
  //loop through array and append info
  for(var i = 0; i <response.length; i++){
      var id = response[i].id;

      $('.container').append('<div class="task task'+id+'"></div>');
      var $el = $('.container').children().last();

      $el.append('<p><strong>Task:</strong> '+response[i].task+'</p>');
      $el.append('<button class="complete id'+id+'"><span>Complete</span></button>');
      $el.append('<button class="delete id'+id+'">Delete</button>');
      $('.id'+id).data('id',id);
      $('.task'+id).data('completed',response[i].completed);
      //check to see if the responses coming back from the server are completed and if so cross them off with and set button to say Un Check
      if(response[i].completed == true){
        $('.task'+id).addClass('crossOut');
        $('.task'+id+' span').text('Un Check');
      }
  }
}
//task to be performed when complete task is pressed
function completeTask(event){
    event.preventDefault();
    var completeStatus = $(this).closest('.task').data('completed');//grab the data that was pulled off on DOM load to determine if completed or not
    //check status of completed. If completed and button is pressed set value to false, update data('completed') and cross out
    if(completeStatus == true){
      completeStatus = false;
      $(this).closest('.task').removeClass('crossOut');
      $(this).closest('task').data('completed',completeStatus);
    }else if(completeStatus == false){ //if tasks completed is false and button is clicked set value to true and update data('completed')
      completeStatus = true;
      $(this).closest('.task').addClass('crossOut');
      $(this).closest('task').data('completed',completeStatus);
    }
    //organize information into an object that will be sent to the server to update database
    var updatedTask = $(this).data('id');

    var taskCompleted = {};
    taskCompleted.id = updatedTask;
    taskCompleted.completed = completeStatus;
    //make ajax request to update database
    $.ajax({
      type: 'PUT',
      url: '/updateTask',
      data: taskCompleted,
      success: loadTasks //load tasks on success after being updated
    });
}
//function to handle delete button being clicked
function deleteTask(event){
  event.preventDefault();
  var deleteTask = $(this).data('id');//id of task to be completed
  var taskDeleted = {};
  taskDeleted.id = deleteTask;
  //make ajax call
  $.ajax({
    type: 'DELETE',
    url: '/deleteTask',
    data: taskDeleted,
    success: getAllTasks //when button is deleted grab all information from the database again and reappend
  });
}
