const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const canvas = document.getElementById("game-area");
const ctx = canvas.getContext("2d");
const fuelDiv = document.getElementById("fuel");
// Set the canvas size to 400x400
canvas.width = 400;
canvas.height = 400;

const prjs = [];

const terrain = [];

class Rect {
  constructor(x, y, w, h, ){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  get top(){
    return this.y;
  }
  get bottom(){
    return this.y + this.h;
  }
  get left(){
    return this.x;
  }
  get right(){
    return this.x + this.w;
  }
  get center(){
    return {x: this.x + this.w * 0.5, y: this.y + this.h * 0.5}
  }
  overlaps(other){
    return !(
      this.bottom < other.top ||
      this.top > other.bottom ||
      this.left > other.right ||
      this.right < other.left
       )
  }
}

const gravity = 0.01;
const sideEngineThrust = 0.01;
const mainEngineThrust = 0.03;

var fuel = 2000; 

const ship = new Rect(0, 0, 8, 22)
ship.color = "green";
ship.dx = 0;
ship.dy = 0;
ship.mainEngine = false;
ship.rightEngine = false;
ship.leftEngine = false;
ship.crashed = false;
ship.landed = false;
ship.LZbuffer = 3;

const platform = new Rect(185, 380, 30, 5);
platform.color = "black";

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
function createTerrain(){
  var one = 245 + Math.random()*100;
  var two = 250 + Math.random()*120;
  var three = 230 + Math.random()*120;
  var four = 245 + Math.random()*140;
  var five = 250 + Math.random()*100
  terrain.push([0, one]);
  terrain.push([100, two]);
  terrain.push([platform.left, platform.bottom]);
  terrain.push([platform.right, platform.bottom]);
  terrain.push([300, three]);
  terrain.push([350, four]);
  terrain.push([400, five]);
}
function initPrjs(){
  for (let i = 0; i < 10; i ++){
    let prj = new Rect(Math.floor(Math.random() * 400), 0, 4, 4);
    prj.dx = 1-(Math.random()*2);
    prj.dy = Math.random();
    prj.color = "yellow";
    prjs.push(prj);
  }
  if (!gameEnd){
    setTimeout(initPrjs, 5000); 
  }
}

function initPrjs2(){
  for (let i = 0; i < 10; i ++){
    let prj = new Rect(ship.x, ship.y, 4, 4);
    prj.dx = Math.random() * 10 - 5,
     prj.dy = Math.random() * 2 - 1,
     prj.color = "green",
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

function drawTerrain(){
  ctx.beginPath();
  ctx.moveTo(0, 400);
  for (let i = 0; i < terrain.length; i++){
    ctx.lineTo(terrain[i][0], terrain[i][1]);
  }
  ctx.lineTo(400, 400);
  ctx.closePath();
  ctx.fillStyle = "grey";
  ctx.fill();
}

function drawShip() {
  ctx.save();
  ctx.beginPath();
  ctx.translate(ship.center.x, ship.center.y);
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

function distance(a, b){
  return Math.hypot(a[0]-b[0], a[1]-b[1]);
}

function checkCollision() {
  for (let i = 0; i < terrain.length -1; i++){
    const a = terrain[i];
    const b = terrain[i +1];
    const l = [ship.left, ship.bottom];
    const r = [ship.right, ship.bottom];
    const ablen = distance(a, b);
    const allen = distance(a, l);
    const arlen = distance(a, r);
    const lblen = distance(l, b);
    const rblen = distance(r, b);

    const fudge = 0.1;


    if (ablen + fudge > allen + lblen){
      ship.crashed = true;
      return;
    }
    if (ablen + fudge > arlen + rblen){
      ship.crashed = true;
      return;
    }
  }

  if(ship.top < 0 || ship.bottom > canvas.height || ship.right > canvas.height || ship.left < 0){
    ship.crashed = true;
    return;
  }
  if(ship.overlaps(platform)){
    ship.crashed = true;
    return;
  }
  

  for(let i = 0; i < prjs.length; i ++){
    if(ship.overlaps(prjs[i])){
      ship.crashed = true;
      return;
    }
  }

  if(
    ship.dx < 0.2 &&
    ship.dy < 0.2 &&
    ship.left > platform.left &&
    ship.right < platform.right &&
    ship.bottom < platform.top &&
    platform.top - ship.bottom < ship.LZbuffer
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
  drawTerrain();
  ex = false;
}

var ex = false;

function endGameLoop(){
  updatePrjs();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatform();
  drawPrjs();
  drawTerrain();
  if (ex){
    ctx.fillStyle = "orange";
    ctx.fillRect(ship.x - 11, ship.y - 12, 23, 23)
    fillStar(ship.x - 24, ship.y - 25, 50)
  }
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
    ex = true;
    requestAnimationFrame(endGameLoop)
  } else if (ship.landed) {
    statusDiv.innerHTML = "LANDED - You Win!";
    endGame();
  } else {
    // Clear entire screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPrjs();
    drawShip();
    drawPlatform();
    drawTerrain();
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
    case 32:
      start();
      break;
    default:
      return;
  }
  // don't let arrow keys move screen around
  event.preventDefault();
}

function start() {
  gameEnd = false;
  prjs.length = 0;
  fuel = 1000;
  terrain.length = 0;
  createTerrain();
  fuelDiv.innerHTML = "Fuel: " + fuel + " gallons";
  startBtn.disabled = true;
  statusDiv.innerHTML = "";
  initPrjs();
  initShip();

  document.addEventListener("keyup", keyLetGo);
  document.addEventListener("keydown", keyPressed);
  requestAnimationFrame(gameLoop);
}

var gameEnd;

function endGame() {
  gameEnd = true;
  startBtn.disabled = false;
  document.removeEventListener("keyup", keyLetGo);
  document.removeEventListener("keydown", keyPressed);
}
