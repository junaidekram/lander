const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");
const fuelDiv = document.getElementById("fuel");
// Set the canvas size to 400x400
canvas.width = 400;
canvas.height = 400;

const prjs = [];

const gravity = 0.01;
const sideEngineThrust = 0.01;
const mainEngineThrust = 0.03;

var fuel = 2000; 

const ship = {
  color: "green",
  // height, width
  w: 8,
  h: 22,
  // position
  x: 0,
  y: 0,
  // velocity
  dx: 0,
  dy: 0,
  mainEngine: false,
  leftEngine: false,
  rightEngine: false,
  crashed: false,
  landed: false,
  LZbuffer : 3,
};

const platform = {
  color: "black",
  w: 40,
  h: 10,
  x: 180,
  y: 390,
  top: 390,
  left: 180,
  right: 220
}

function drawPlatform(){
  ctx.fillStyle = platform.color;
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
}

function drawPrjs(){
  for(let i = 0; i < prjs.length; i ++){
    let prj = prjs[i];
    ctx.fillStyle = prj.color;
    ctx.fillRect(prj.x, prj.y, prj.w, prj.h);
  }
}

function initShip() {
  // position
  ship.x = 150 + Math.random() * 100;
  ship.y = 150 + Math.random() * 100;
  // velocity
  ship.dx = Math.random();
  ship.dy = Math.random();
  ship.mainEngine = false;
  ship.leftEngine = false;
  ship.rightEngine = false;
  ship.crashed = false;
  ship.landed = false;
}

function initPrjs(){
  prjs.length = 0;
  for (let i = 0; i < 10; i ++){
    let prj = {
      x : Math.floor(Math.random() * 400),
      y : 0,
      dx : 1-(Math.random() * 2),
      dy : Math.random(),
      h: 4,
      w:4,
      color: "yellow",
    }
    prjs.push(prj);
  }
}

function initPrjs2(){
  for (let i = 0; i < 10; i ++){
    let prj = {
      x : ship.x,
      y : ship.y,
      dx : Math.random() * 10 - 5,
      dy : Math.random() * 2 - 1,
      h: 4,
      w: 4,
      color: "green",
    }
    prjs.push(prj);
  }
}

function drawTriangle(a, b, c, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.lineTo(c[0], c[1]);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawShip() {
  ctx.save();
  ctx.beginPath();
  ctx.translate(ship.x, ship.y);
  ctx.rect(ship.w * -0.5, ship.h * -0.5, ship.w, ship.h);
  ctx.fillStyle = ship.color;
  ctx.fill();
  ctx.closePath();

  // Draw the flame if engine is on
  if (ship.mainEngine) {
    drawTriangle(
      [ship.w * -0.5, ship.h * 0.5],
      [ship.w * 0.5, ship.h * 0.5],
      [0, ship.h * 0.5 + Math.random() * 10],
      "yellow"
    );
  }
  if (ship.rightEngine) {
    drawTriangle(
      [ship.w * 0.5, ship.h * -0.25],
      [ship.w * 0.5 + Math.random() * 10, 0],
      [ship.w * 0.5, ship.h * 0.25],
      "orange"
    ); 
  }
  if (ship.leftEngine) {
    drawTriangle(
      [ship.w * -0.5, ship.h * -0.25],
      [ship.w * -0.5 - Math.random() * 10, 0],
      [ship.w * -0.5, ship.h * 0.25],
      "orange"
    );
  }
  ctx.restore();
}

function updateShip() {
  ship.dy += gravity;
  if (fuel < 3){
    ship.mainEngine = false
  }
  if (fuel < 1){
    ship.rightEngine = false;
    ship.leftEngine = false;
  }
  if (ship.mainEngine){
    ship.dy -= mainEngineThrust;
    fuel -= 3;
  }
  ship.y += ship.dy;
  if (ship.leftEngine){
    ship.dx += sideEngineThrust;
    fuel -= 1;
  }
  if (ship.rightEngine){
    ship.dx -= sideEngineThrust;
    fuel -= 1;
  }
  ship.x += ship.dx;
  // TODO: update ship.dx, dy
  // what forces acting on the ship?
  // - left, right, main thruster
  // - gravity
  // TODO: update the position - how does dx, dy affect x, y?
}

function updatePrjs(){
  for(let i = 0; i < prjs.length; i ++){
    let prj = prjs[i];
    prj.dy += gravity;
    prj.x += prj.dx;
    prj.y += prj.dy;
  }
}

var shipcrash
function checkCollision() {
  const top = ship.y - ship.h / 2;
  const bottom = ship.y + ship.h / 2;
  const left = ship.x - ship.w / 2;
  const right = ship.x + ship.w / 2;
  if(top < 0 || bottom > canvas.height || right > canvas.height || left < 0){
    ship.crashed = true;
  }
  const isNotCrashedPlatform = 
    bottom < platform.top ||
    left > platform.right ||
    right < platform.left;
  if (!isNotCrashedPlatform){
    ship.crashed = true;
    return; 
  }
  if(
    ship.dx < 0.2 &&
    ship.dy < 0.2 &&
    left > platform.left &&
    right < platform.right &&
    bottom < platform.top &&
    platform.top - bottom < ship.LZbuffer
  ){
    ship.landed = true;
    return; 
  }
}

function fillStar(x, y, s) {
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.4);
  ctx.lineTo(x + s, y + s * 0.4);
  ctx.lineTo(x + s * 0.15, y + s * 0.9);
  ctx.lineTo(x + s / 2, y);
  ctx.lineTo(x + s * 0.85, y + s * 0.9);
  ctx.lineTo(x, y + s * 0.4);
  ctx.fill();
}

function clear(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatform();
  drawPrjs();
}

function endGameLoop(){
  updatePrjs();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatform();
  drawPrjs();
  if(!startBtn.disabled){
    requestAnimationFrame(endGameLoop)
  }
}


function gameLoop() {
  updateShip(); 
  updatePrjs();
  fuelDiv.innerHTML = "Fuel: " + fuel + " gallons";
  checkCollision();
  if (ship.crashed) {
    statusDiv.innerHTML = "GAME OVER - Crashed";
    ctx.fillStyle = "orange";
    endGame();
    ctx.fillRect(ship.x - 11, ship.y - 12, 23, 23)
    fillStar(ship.x - 24, ship.y - 25, 50)
    setTimeout(clear, 2000);
    initPrjs2();
    requestAnimationFrame(endGameLoop)
  } else if (ship.landed) {
    statusDiv.innerHTML = "LANDED - You Win!";
    endGame();
  } else {
    // Clear entire screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawPlatform();
    drawPrjs();
    requestAnimationFrame(gameLoop);
  } 

}

function keyLetGo(event) {
  switch (event.keyCode) {
    case 37: // Left Arrow key
      ship.leftEngine = false;
      break;
    case 39: // Right Arrow key
      ship.rightEngine = false;
      break;
    case 40: // Down Arrow key
      ship.mainEngine = false;
      break;
    default:
      return;
  }
  // don't let arrow keys move screen around
  event.preventDefault();
}

function keyPressed(event) {
  switch (event.keyCode) {
    case 37: // Left Arrow key
      ship.leftEngine = true;
      break;
    case 39: // Right Arrow key
      ship.rightEngine = true;
      break;
    case 40: // Down Arrow key
      ship.mainEngine = true;
      break;
    default:
      return;
  }
  // don't let arrow keys move screen around
  event.preventDefault();
}

function start() {
  fuel = 1000;
  fuelDiv.innerHTML = "Fuel: " + fuel + " gallons";
  startBtn.disabled = true;
  statusDiv.innerHTML = "";
  initPrjs();
  initShip();

  document.addEventListener("keyup", keyLetGo);
  document.addEventListener("keydown", keyPressed);
  requestAnimationFrame(gameLoop);
}

function endGame() {
  // console.log("endGame", ship);
  startBtn.disabled = false;
  document.removeEventListener("keyup", keyLetGo);
  document.removeEventListener("keydown", keyPressed);
}
