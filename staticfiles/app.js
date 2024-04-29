const BASE_URL = 'http://127.0.0.1:8000';

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch(`${BASE_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('isAdmin', data.is_admin);
      localStorage.setItem('userid', data.user_id);
      window.location.href = `${BASE_URL}/ui/rooms/`
    } else {
      alert('Invalid username or password');
    }
  });
}

// Register
const registerForm = document.getElementById('reg-submit');
if (registerForm) {
  registerForm.addEventListener('click', async (e) => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const is_admin = document.getElementById('is_admin').checked;

    if (!(username && password)) {
      alert('Please fill in all fields');
      return;
    }
    const response = await fetch(`${BASE_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, is_admin })
    });
    if (response.ok) {
      window.location.href = `${BASE_URL}/ui/login/`;
    } else {
      alert($`Registration failed {response.error}`);
    }
  });
}

// Rooms
const roomList = document.getElementById('roomList');
const createRoomBtn = document.getElementById('createRoomBtn');
const createRoomModal = document.getElementById('createRoomModal');
const closeModal = document.getElementsByClassName('close')[0];

// Check if the user is an admin
const isAdmin = localStorage.getItem('isAdmin') === 'true';

if (roomList) {
  fetchRooms();
}

// Fetch and display rooms
async function fetchRooms() {
  const response = await fetch(`${BASE_URL}/rooms/`, {
    headers: {
      'Authorization': `Token ${localStorage.getItem('authToken')}`
    }
  });
  const rooms = await response.json();
  roomList.innerHTML = '';
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.dataset.roomId = room.id;
    const roomName = document.createElement('span');
    roomName.textContent = room.name;
    li.appendChild(roomName);
    if (isAdmin) {
      // Add edit and delete buttons for admins
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      console.log(editBtn);
      editBtn.addEventListener('click', () => showEditRoomModal(room, room.id));
      li.appendChild(editBtn);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteRoom(room.id));
      li.appendChild(deleteBtn);
      const joinBtn = document.createElement('button');
      const userId = localStorage.getItem('userid');
      const isUserJoined = room.users.includes(parseInt(userId));

      joinBtn.textContent = isUserJoined? 'Open' : 'Join';
      li.appendChild(joinBtn);
      if (!isUserJoined) {
        joinBtn.addEventListener('click', () => joinRoom(room.id));
      } else {
        joinBtn.addEventListener('click', () => openRoom(room.id));
      }
    } else {
      const joinBtn = document.createElement('button');
      const userId = localStorage.getItem('userid');
      const isUserJoined = room.users.includes(parseInt(userId));

      joinBtn.textContent = isUserJoined? 'Open' : 'Join';
      li.appendChild(joinBtn);
      if (!isUserJoined) {
        joinBtn.addEventListener('click', () => joinRoom(room.id));
      } else {
        joinBtn.addEventListener('click', () => openRoom(room.id));
      }
    }
    roomList.appendChild(li);
  });
}

// Join room
async function joinRoom(roomId) {
  const response = await fetch(`${BASE_URL}/rooms/${roomId}/join/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${localStorage.getItem('authToken')}`
    }
  });
  if (response.ok) {
    alert('You have joined the room');
    fetchRooms();
  }
}

// Show create room modal
if (createRoomBtn) {
  createRoomBtn.addEventListener('click', () => {
    if (isAdmin) {
      createRoomModal.style.display = 'block';
    } else {
      alert('You do not have permission to create a room');
    }
  });
}

// Close create room modal
if (closeModal) {
  closeModal.addEventListener('click', () => {
    createRoomModal.style.display = 'none';
  });
}

// Create room
const createRoomForm = document.getElementById('createRoomForm');
if (createRoomForm) {
  createRoomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomName = document.getElementById('roomName').value;
    const roomTopic = document.getElementById('roomTopic').value;
    const response = await fetch(`${BASE_URL}/rooms/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: roomName, topic: roomTopic, created_by: localStorage.getItem('userid') })
    });
    if (response.ok) {
      createRoomModal.style.display = 'none';
      fetchRooms();
    } else {
      alert('Failed to create room');
    }
  });
}

// Open room
async function openRoom(roomId) {
  window.location.href = `${BASE_URL}/ui/room/${roomId}/`;
}

async function getmessages(roomId) {       
    console.log("called");
    const response = await fetch(`${BASE_URL}/messages/${parseInt(roomId)}/`, {
        headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
        });
    const room = await response.json();
    console.log(room);
    
    // Render room details
    const roomName = document.getElementById('roomName');
    roomName.textContent = room.name;
    
    // Render messages
    const messageContainer = document.getElementById('messageContainer');
    messageContainer.innerHTML = '';
    room.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.user}: ${message.content}`;
        messageContainer.appendChild(messageElement);
    });
    
    // Setup WebSocket connection
    const roomSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${room.id}/`);
    
    roomSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        const messageElement = document.createElement('div');
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageContainer.appendChild(messageElement);
    };
    
    roomSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
    
    const sendMessageForm = document.getElementById('sendMessageForm');
    sendMessageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value;
        roomSocket.send(JSON.stringify({
        'message': message
        }));
        messageInput.value = '';
    });
    
    // Show edit and delete buttons for admins
    // if (isAdmin) {
    //     const editRoomBtn = document.createElement('button');
    //     editRoomBtn.textContent = 'Edit Room';
    //     editRoomBtn.addEventListener('click', () => showEditRoomModal(room));
    //     document.body.appendChild(editRoomBtn);
    
    //     const deleteRoomBtn = document.createElement('button');
    //     deleteRoomBtn.textContent = 'Delete Room';
    //     deleteRoomBtn.addEventListener('click', () => deleteRoom(room.id));
    //     document.body.appendChild(deleteRoomBtn);
    // }
}

// Edit room
function showEditRoomModal(room) {

    const editRoomModal = document.querySelector('#modal');
    editRoomModal.innerHTML = `
        <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Edit Room</h2>
        <form id="editRoomForm">
            <div class="form-group">
            <label for="editRoomName">Room Name:</label>
            <input type="text" id="editRoomName" name="editRoomName" value="${room.name}" required>
            </div>
            <div class="form-group">
            <label for="editRoomTopic">Room Topic:</label>
            <input type="text" id="editRoomTopic" name="editRoomTopic" value="${room.topic}">
            </div>
            <button type="submit">Save</button>
        </form>
        </div>
    `;
    

    const closeEditModal = editRoomModal.querySelector('.close');
    closeEditModal.addEventListener('click', () => {
        editRoomModal.remove();
    });

    const editRoomForm = editRoomModal.querySelector('#editRoomForm');
    editRoomForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editedRoomName = editRoomModal.querySelector('#editRoomName').value;
        const editedRoomTopic = editRoomModal.querySelector('#editRoomTopic').value;
        const response = await fetch(`${BASE_URL}/rooms/${room.id}/`, {
        method: 'PUT',
        headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editedRoomName, topic: editedRoomTopic, created_by: localStorage.getItem('userid') })
        });
        if (response.ok) {
        editRoomModal.innerHTML = ``;
        fetchRooms();
        } else {
        alert('Failed to update room');
        }
  });
}

// Delete room
async function deleteRoom(roomId) {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
    });
    if (response.ok) {
        fetchRooms();
    } else {
        alert('Failed to delete room');
    }
}