/* ============== socket.io測試 ============ */
var socket = io('https://soselab.asuscomm.com:55002');
var room_number = [];
$(document).ready(function() {
    socket.on('connect', function(response) {
      console.log('connect response : ' + response);
      if(room_number == null) join_room();
    })

    socket.on('room_msg', function(response) {
      console.log('room_msg : ' + response);
      document.getElementById("messages").innerHTML += '<li class="list-group-item">' 
                                                        + '(Room ' +  response['room'] + ') '
                                                        + '<b>' + response['id'] + '</b> : '
                                                        +  response['msg'] +'</li>';
      $("#user_input").val("");
   });
});



function join_room(){
    var room_to_join = window.prompt('Room number')
    room_number.push(room_to_join);
    socket.emit('join_room' , {'id': socket.id,'room':room_to_join});
    refresh_info();
}

function leave_room(room){
    var room_to_leave = window.prompt('Room number')
    socket.emit('leave_room' , {'id': socket.id,'room':room_to_leave});
    room_number.forEach(function(item, index, arr) {
        if(item === room_to_leave) {
            arr.splice(index, 1);
        }
    });
    refresh_info();
}

function refresh_info(){
    document.getElementById("user_info").innerHTML = '<p><strong>Socket id :</strong> ' + socket.id + '<br><strong>Room :</strong> ' + room_number + '</p>';
}
function send_message(){
    socket.emit('send_msg' , {'id': socket.id,'room': $("#room_input").val(),'msg': $("#user_input").val()});
}
