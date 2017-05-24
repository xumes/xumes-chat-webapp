$(document).ready(function() {
  (function() {
    $('.chatbox').hide()
    var getRooms = function() {
            return $.get('http://localhost:3000/rooms', function(data) {
                if (!data.status) {
                    return
                }

                var rooms = data && data.rooms

        var titleTemplate = '<li class="list-group-item title"> ' +
        					          '  <h4>Channels (' + rooms.length +')</h4> ' +
        				            '</li>'

        $('.channels').append(titleTemplate)

        rooms.forEach(function(room, index) {
          var roomTemplate = '<li class="list-group-item channel" name= "' + room.name + '" channel="' + room._id + '">'+
                              ' <i class="fa fa-comment-o"></i> '+
                               room.name +
                              '</li>'
          $('.channels').append(roomTemplate)
        })


      })
    }

    var getUsers = function() {
      $.get('http://localhost:3000/users', function(data) {
        if (!data.status) {
          return
        }

        var users = data && data.users
        users.forEach(function(user, index) {
            var userTemplate = '<li class="list-group-item user" user="' + user._id + '" username="' + user.name + '"> ' + user.name + ' </li>'
            $('.messages').append(userTemplate)
        })

      })
    }
    getRooms()
    getUsers()
  })()

  var socket = io('//localhost:3000')
  var currentRoom = undefined
  var currentUser = undefined

  $('.channels').on('click', '.channel', function(e) {
  		var roomId = $(this).attr('channel')
  		var roomName = $(this).attr('name')

    console.log(roomId)
    // console.log(roomName)

    socket.emit('join room', {
      room: roomId,
      roomName: roomName
    })

    $('.conversation').html('')

    return false
  })

  $('.messages').on('click', '.user', function(e){
    var username = $(this).attr('username')
		var user = $(this).attr('user')

      socket.emit('join user', {
        userId: user,
			  username: username
      })

      console.log("user id", user)
      console.log("username", username)

    $('.conversation').html('')
    return false
  })

  $('#btn_leave').on('click', function(e){
    var roomId = $(this).attr('channel')

    socket.emit('leave room', {
      room: roomId
    })

    return false
  })

  $('#message').on('keypress', function(e) {
    if (e.which == 13 || e.keyCode == 13) {
      var message = $('#message').val()

      if(!message) {
        return
      }

      if(!currentRoom){
        socket.emit('message user', {
          message: message,
          user: currentUser
        })
      } else {
        socket.emit('message room', {
          message: message,
          room: currentRoom
        })
      }

      var msgTemplate =  '<div class="col-xs-12 message">' +
                      '  <div class="avatar col-xs-6 col-md-1">' +
                      '     <h2>{`.`}</h2>' +
                      '  </div>' +
                      '  <p class="text col-xs-6 col-md-11">' + message + '</p>' +
                      '</div>'

      $('.conversation').append(msgTemplate)
      $('#message').val('') //clean the message input text

      return false
    }
  })

  socket.on('joined user', function(data) {
    currentUser = data.user
    $('.username').html('@' + data.username)
    $('.chatbox').show()
  })

  socket.on('joined room', function(data) {
    currentRoom = data.room
    $('.username').html('@' + data.roomName)
    $('.chatbox').show()
  })

  socket.on('leaved room', function(data) {
    currentRoom = undefined
    $('.chatbox').hide()
    $('.conversation').html('')
  })

  socket.on('messaged', function(data) {
    if(!data.message) {
      return
    }

    var template =  '<div class="col-xs-12 message">' +
                    '  <div class="avatar col-xs-6 col-md-1">' +
                    '     <h2>{`.`}</h2>' +
                    '  </div>' +
                    '  <p class="text col-xs-6 col-md-11">' + data.message + '</p>' +
                    '</div>'

                    $('.conversation').append(template)
  })

})
