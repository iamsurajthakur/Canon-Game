const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

let cannonImg = new Image();
cannonImg.src =
  "https://ia903407.us.archive.org/7/items/cannon_202104/cannon.png";
cannonImg.onload = renderImg;
let cannonSound = new Audio(
  "https://ia803405.us.archive.org/1/items/metal-block/Anti%20Aircraft%20Cannon-18363-Free-Loops.com.mp3"
);

let mousePos = null;
let angle = null;
let cannonBalls = [];
let cannonShoot = true;

let imgCount = 1;
function renderImg() {
  if (--imgCount > 0) {
    return;
  }
  animate();
}

function sortBallPos(x, y) {
  let rotatedAngle = angle;
  let dx = x - (cannon.x + 15);
  let dy = y - (cannon.y - 50);
  let distance = Math.sqrt(dx * dx + dy * dy);
  let originalAngle = Math.atan2(dy, dx);

  let newX = cannon.x + 15 + distance * Math.cos(originalAngle + rotatedAngle);
  let newY = cannon.y - 50 + distance * Math.sin(originalAngle + rotatedAngle);

  return {
    x: newX,
    y: newY,
  };
}

function darwBorder() {
  ctx.fillStyle = "#666666";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(20, 20, 560, 560);
}

class Cannon {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.topX = x - 30;
    this.topY = y - 90;
  }

  stand() {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 10, this.y - 50);
    ctx.lineTo(this.x + 30, this.y);
    ctx.stroke();
    ctx.closePath();
  }
  rotate() {
    if (mousePos) {
      angle = Math.atan2(
        mousePos.y - (this.y - 50),
        mousePos.x - (this.x + 15)
      );
      ctx.translate(this.x + 15, this.y - 50);
      ctx.rotate(angle);
      ctx.translate(-(this.x + 15), -(this.y - 50));
    }
  }
  draw() {
    this.stand();
    ctx.save();
    this.rotate();
    ctx.drawImage(cannonImg, this.topX, this.topY, 100, 50);
  }
}

let cannon = new Cannon(80, 580);

class cannonBall {
  constructor(angle, x, y) {
    this.radius = 15;
    this.mass = this.radius;
    this.angle = angle;
    this.x = x;
    this.y = y;
    this.dx = Math.cos(angle) * 7;
    this.dy = Math.sin(angle) * 7;
    this.gravity = 0.05;
    this.elasticity = 0.5;
    this.friction = 0.008;
    this.colAudio = new Audio(
      "https://ia903405.us.archive.org/28/items/metal-block_202104/metal-block.wav"
    );
    this.colAudio.volume = 0.7;
    this.shouldAudio = true;
    this.timeDiff1 = null;
    this.timeDiff2 = new Date();
  }
  move() {
    if (this.y + this.gravity < 580) {
      this.dy += this.gravity;
    }

    this.dx = this.dx - this.dx * this.friction;

    this.x += this.dx;
    this.y += this.dy;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }
}

function hitWall(ball) {
  if (
    ball.x + ball.radius > 580 ||
    ball.x - ball.radius < 20 ||
    ball.y + ball.radius > 580 ||
    ball.y - ball.radius < 20
  ) {
    if (ball.timeDiff1) {
      ball.timeDiff2 = new Date() - ball.timeDiff1;
      ball.timeDiff2 < 200 ? (ball.shouldAudio = false) : null;
    }
    if (ball.shouldAudio) ball.colAudio.play();

    ball.dy = ball.dy * ball.elasticity;

    if (ball.x + ball.radius > 580) {
      ball.x = 580 - ball.radius;
      ball.dx *= -1;
    } else if (ball.x - ball.radius < 20) {
      ball.x = 20 + ball.radius;
      ball.dx *= -1;
    } else if (ball.y + ball.radius > 580) {
      ball.y = 580 - ball.radius;
      ball.dy *= -1;
    } else if (ball.y - ball.radius < 20) {
      ball.y = 20 + ball.radius;
      ball.dy *= -1;
    }
    ball.timeDiff1 = new Date();
  }
}
function collide(index) {
  let ball = cannonBalls[index];
  for (let j = index + 1; j < cannonBalls.length; j++) {
    let testBall = cannonBalls[j];
    if (ballHitBall(ball, testBall)) {
      collideBalls(ball, testBall);
    }
  }
}
function ballHitBall(ball1, ball2) {
  let collision = false;
  let dx = ball1.x - ball2.x;
  let dy = ball1.y - ball2.y;
  let distance = dx * dx + dy * dy;
  if (
    distance <=
    (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius)
  ) {
    collision = true;
  }
  return collision;
  console.log(ball2.x);
}

function collideBalls(ball1, ball2) {
  let dx = ball2.x - ball1.x;
  let dy = ball2.y - ball1.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let vCollision = { x: dx / distance, y: dy / distance };
  let vRelative = { x: ball1.dx - ball2.dx, y: ball1.dy - ball2.dy };
  let speed = vRelative.x * vCollision.x + vRelative.y * vCollision.y;
  if (speed < 0) return;
  let impulse = (2 * speed) / (ball1.mass + ball2.mass);
  ball1.dx -= impulse * ball2.mass * vCollision.x;
  ball1.dy -= impulse * ball2.mass * vCollision.y;
  ball2.dx += impulse * ball1.mass * vCollision.x;
  ball2.dy += impulse * ball1.mass * vCollision.y;
  ball1.dy = ball1.dy * ball1.elasticity;
  ball2.dy = ball2.dy * ball2.elasticity;
}
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  darwBorder();
  cannon.draw();
  ctx.restore();

  cannonBalls.forEach((ball, index) => {
    ball.draw();
    hitWall(ball);
    collide(index);
    ball.move();
  });
}

canvas.addEventListener("mousemove", (e) => {
  mousePos = {
    x: e.clientX - canvas.offsetLeft,
    y: e.clientY - canvas.offsetTop,
  };
});
canvas.addEventListener("click", (e) => {
  if (angle < -2 || angle > 0.5) {
    return;
  }

  if (!cannonShoot) return;
  cannonShoot = false;

  let ballPos = sortBallPos(cannon.topX + 100, cannon.topY + 30);

  cannonSound.currentTime = 0.2;
  cannonSound.play();

  cannonBalls.push(new cannonBall(angle, ballPos.x, ballPos.y));

  setTimeout(() => {
    cannonShoot = true;
  }, 1000);
});
canvas.addEventListener("touch", (e) => {
  if (angle < -2 || angle > 0.5) {
    return;
  }

  if (!cannonShoot) return;
  cannonShoot = false;

  let ballPos = sortBallPos(cannon.topX + 100, cannon.topY + 30);

  cannonSound.currentTime = 0.2;
  cannonSound.play();

  cannonBalls.push(new cannonBall(angle, ballPos.x, ballPos.y));

  setTimeout(() => {
    cannonShoot = true;
  }, 1000);
});
