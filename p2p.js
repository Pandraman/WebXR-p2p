// Include PeerJS library in your HTML before this script
// <script src="https://cdn.jsdelivr.net/npm/peerjs@1.3.2/dist/peerjs.min.js"></script>

let playerId = Math.floor(Math.random() * 10).toString();
let peer = new Peer(playerId);
let conn;

peer.on('open', (id) => {
  console.log('My peer ID is: ' + id);
  console.log(id);
  // Connect to another player by entering their ID
  let remoteId = prompt("ID: "+id+"     Enter opponent's Peer ID:");
  if (remoteId) {
    conn = peer.connect(remoteId);
    setupConnectionEvents();
  }
});

peer.on('connection', (incomingConn) => {
  conn = incomingConn;
  setupConnectionEvents();
});

function setupConnectionEvents() {
  conn.on('open', () => {
    console.log('Connected to peer');
  });

  conn.on('data', (data) => {
    if (data.position) {
      let remotePlayer = document.getElementById('remotePlayer');
      if (remotePlayer) {
        console.log(`Received position: x=${data.position.x}, y=${data.position.y}, z=${data.position.z}`);
        remotePlayer.setAttribute('position', `${data.position.x} ${data.position.y} ${data.position.z}`);
      }
    }
  });
}

AFRAME.registerComponent('sync-position', {
  init: function () {
    // Set a random initial position for the local player
    let randomPosition = {
      x: Math.random() * 10 - 5,
      y: 1.6,
      z: Math.random() * 10 - 5
    };
    this.el.setAttribute('position', `${randomPosition.x} ${randomPosition.y} ${randomPosition.z}`);
    console.log(`Initial position set to: x=${randomPosition.x}, y=${randomPosition.y}, z=${randomPosition.z}`);
    this.previousPosition = { x: randomPosition.x, y: randomPosition.y, z: randomPosition.z };
  },
  tick: function () {
    if (conn && conn.open) {
      let position = this.el.getAttribute('position'); // Get A-Frame position
      let distance = Math.sqrt(
        Math.pow(position.x - this.previousPosition.x, 2) +
        Math.pow(position.y - this.previousPosition.y, 2) +
        Math.pow(position.z - this.previousPosition.z, 2)
      );
      if (distance > 0.1) {
        console.log(`Sending position: x=${position.x}, y=${position.y}, z=${position.z}`);
        conn.send({ position: { x: position.x, y: position.y, z: position.z } });
        this.previousPosition = { x: position.x, y: position.y, z: position.z };
      }
    }
  }
});
