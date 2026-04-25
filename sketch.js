// 定義一個類別來表示時間軸上的週次節點
class TimelineNode {
  constructor(x, y, weekNum, htmlPath, nodeSize = 30) {
    this.x = x;
    this.y = y;
    this.weekNum = weekNum;
    this.htmlPath = htmlPath;
    this.nodeSize = nodeSize;
    this.isHovered = false;
    this.baseColor = color(88, 168, 197);
    this.currentSize = nodeSize;
    this.targetSize = nodeSize;
    this.bloomFactor = 0;
    this.animationSpeed = 0.12;
    this.isActive = false; // 新增：追蹤是否為當前選中節點
  }

  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    this.isHovered = d < this.nodeSize / 2;
    // 如果是選中狀態或滑鼠懸停，保持較大尺寸
    this.targetSize = (this.isHovered || this.isActive) ? this.nodeSize * 1.25 : this.nodeSize;
  }

  display() {
    this.currentSize = lerp(this.currentSize, this.targetSize, this.animationSpeed);
    // 如果是選中狀態，花朵保持半綻放以上
    let targetBloom = this.isHovered ? 1 : (this.isActive ? 0.6 : 0);
    this.bloomFactor = lerp(this.bloomFactor, targetBloom, this.animationSpeed);

    push();
    translate(this.x, this.y);

    let petalCount = 7;
    let petalColor = lerpColor(this.baseColor, color(255, 183, 197), this.bloomFactor);
    for (let i = 0; i < petalCount; i++) {
      push();
      let angle = TWO_PI / petalCount * i;
      if (this.isHovered) {
        angle += sin(frameCount * 0.03 + i) * 0.12;
      }
      rotate(angle);

      fill(petalColor);
      noStroke();
      let pLen = this.currentSize * (0.55 + this.bloomFactor * 0.9);
      let pWid = this.currentSize * (0.24 + this.bloomFactor * 0.18);
      beginShape();
      vertex(0, 0);
      bezierVertex(-pWid, -pLen * 0.45, -pWid, -pLen, 0, -pLen);
      bezierVertex(pWid, -pLen, pWid, -pLen * 0.45, 0, 0);
      endShape(CLOSE);
      pop();
    }

    fill(lerpColor(color(255, 220, 85), color(255, 255, 255), this.bloomFactor));
    noStroke();
    ellipse(0, 0, this.currentSize * 0.48);

    // 更大更豐富的葉片，讓花朵有更多枝葉感
    if (this.bloomFactor > 0 || this.isHovered) {
      drawNodeLeaves(this.currentSize * 0.8);
    }

    // 選中時文字加粗或改變顏色
    if (this.isActive) {
      fill(139, 77, 197);
      stroke(255);
      strokeWeight(1);
    } else {
      fill(34, 34, 34);
      noStroke();
    }
    textAlign(CENTER, CENTER);
    textSize(this.currentSize * 0.35);
    text(`W${this.weekNum}`, 0, 0);

    pop();

    if (this.isHovered || this.bloomFactor > 0.1) {
      push();
      stroke(83, 171, 106, 180 * this.bloomFactor);
      strokeWeight(2);
      let wave = sin(frameCount * 0.05 + this.x * 0.1) * 14 * this.bloomFactor;
      line(this.x, this.y + this.currentSize * 0.55, this.x + wave, this.y + this.currentSize + 20);
      pop();
    }
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    // 擴大點擊判定範圍，確保點擊到綻放後的花瓣也能正確觸發
    return d < this.currentSize * 0.8;
  }

  updateIframe() {
    const iframe = document.getElementById('content-iframe');
    if (iframe) {
      iframe.src = this.htmlPath;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}

function drawNodeLeaves(size) {
  push();
  rotate(-PI / 8);
  fill(76, 171, 121, 220);
  noStroke();
  beginShape();
  vertex(0, 0);
  bezierVertex(size * 0.8, -size * 0.2, size * 0.9, -size * 0.85, 0, -size);
  bezierVertex(-size * 0.9, -size * 0.85, -size * 0.8, -size * 0.2, 0, 0);
  endShape(CLOSE);
  rotate(PI / 4);
  beginShape();
  vertex(0, 0);
  bezierVertex(size * 0.8, -size * 0.25, size * 0.95, -size * 0.9, 0, -size * 1.05);
  bezierVertex(-size * 0.95, -size * 0.9, -size * 0.8, -size * 0.25, 0, 0);
  endShape(CLOSE);
  pop();
}

let nodes = [];
let canvasWidth = 0;
let canvasHeight = 0;

function setup() {
  const container = document.getElementById('p5-canvas-container');
  canvasWidth = container.offsetWidth;
  canvasHeight = container.offsetHeight;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('p5-canvas-container');

  nodes.push(new TimelineNode(canvasWidth * 0.22, canvasHeight * 0.85, 1, 'https://413737171.github.io/20260303-2/', 40));
  nodes.push(new TimelineNode(canvasWidth * 0.36, canvasHeight * 0.72, 2, 'https://413737171.github.io/20260407-1/', 42));
  nodes.push(new TimelineNode(canvasWidth * 0.51, canvasHeight * 0.53, 3, 'https://413737171.github.io/20260317/', 44));
  nodes.push(new TimelineNode(canvasWidth * 0.64, canvasHeight * 0.41, 4, 'https://413737171.github.io/20260324/', 46));
  nodes.push(new TimelineNode(canvasWidth * 0.78, canvasHeight * 0.28, 5, 'https://413737171.github.io/20260310/', 48));
  nodes.push(new TimelineNode(canvasWidth * 0.72, canvasHeight * 0.15, 6, 'https://413737171.github.io/20260420-1/', 50));

  nodes[0].isActive = true; // 預設第一週為選中狀態
  nodes[0].updateIframe();
}

function draw() {
  background(247, 248, 251);

  drawVine();
  for (let node of nodes) {
    node.checkHover(mouseX, mouseY);
    node.display();
  }
}

function drawVine() {
  noFill();
  stroke(102, 67, 33);
  strokeWeight(8);
  beginShape();
  let rootA = canvasWidth * 0.18;
  let rootB = canvasHeight * 0.92;
  let controlX1 = canvasWidth * 0.12 + sin(frameCount * 0.02) * 12;
  let controlY1 = canvasHeight * 0.72 + cos(frameCount * 0.015) * 8;
  let controlX2 = canvasWidth * 0.38 + sin(frameCount * 0.03) * 10;
  let controlY2 = canvasHeight * 0.62 + cos(frameCount * 0.02) * 12;
  let tipX = canvasWidth * 0.52 + sin(frameCount * 0.025) * 6;
  let tipY = canvasHeight * 0.52 + cos(frameCount * 0.03) * 10;
  let branchX = canvasWidth * 0.63 + sin(frameCount * 0.018) * 8;
  let branchY = canvasHeight * 0.43 + cos(frameCount * 0.02) * 6;
  let topX = canvasWidth * 0.82 + sin(frameCount * 0.022) * 10;
  let topY = canvasHeight * 0.28 + cos(frameCount * 0.018) * 8;
  let endX = canvasWidth * 0.7 + sin(frameCount * 0.02) * 6;
  let endY = canvasHeight * 0.12 + cos(frameCount * 0.025) * 10;
  vertex(rootA, rootB);
  bezierVertex(controlX1, controlY1, controlX2, controlY2, tipX, tipY);
  bezierVertex(branchX, branchY, topX, topY, endX, endY);
  endShape();

  drawRootLeaves(rootA, rootB, controlX1, controlY1, controlX2, controlY2, tipX, tipY, branchX, branchY, topX, topY, endX, endY);
}

function drawRootLeaves(x0, y0, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6) {
  let leafPositions = [
    {x: x0, y: y0, dir: -1},
    {x: x1, y: y1, dir: 1},
    {x: x2, y: y2, dir: -1},
    {x: x3, y: y3, dir: 1},
    {x: x4, y: y4, dir: -1},
    {x: x5, y: y5, dir: 1},
  ];
  for (let leaf of leafPositions) {
    // 讓葉子感應滑鼠距離，滑鼠靠近時會抖動（風吹感）
    let d = dist(mouseX, mouseY, leaf.x, leaf.y);
    let wind = d < 100 ? map(d, 0, 100, 20, 0) : 0;
    let sway = sin(frameCount * 0.04 + leaf.y * 0.05) * (10 + wind);
    let leafWidth = 38;
    let leafHeight = 78;
    push();
    translate(leaf.x, leaf.y);
    rotate(leaf.dir * PI / 8 + sway * 0.01);
    noStroke();
    fill(77, 162, 121, 210);
    beginShape();
    vertex(0, 0);
    bezierVertex(leafWidth * 0.5, -leafHeight * 0.15, leafWidth * 0.8, -leafHeight * 0.7, 0, -leafHeight);
    bezierVertex(-leafWidth * 0.8, -leafHeight * 0.7, -leafWidth * 0.5, -leafHeight * 0.15, 0, 0);
    endShape(CLOSE);
    fill(46, 105, 76, 180);
    stroke(36, 82, 69, 180);
    strokeWeight(2);
    line(0, 0, 0, -leafHeight);
    pop();
  }
}

function mouseClicked() {
  for (let node of nodes) {
    if (node.isClicked(mouseX, mouseY)) {
      // 先將所有節點設為非選中，再將點擊的設為選中
      nodes.forEach(n => n.isActive = false);
      node.isActive = true;
      node.updateIframe();
      break;
    }
  }
}

function windowResized() {
  const container = document.getElementById('p5-canvas-container');
  canvasWidth = container.offsetWidth;
  canvasHeight = container.offsetHeight;
  resizeCanvas(canvasWidth, canvasHeight);
  if (nodes.length >= 6) {
    nodes[0].setPosition(canvasWidth * 0.22, canvasHeight * 0.85);
    nodes[1].setPosition(canvasWidth * 0.36, canvasHeight * 0.72);
    nodes[2].setPosition(canvasWidth * 0.51, canvasHeight * 0.53);
    nodes[3].setPosition(canvasWidth * 0.64, canvasHeight * 0.41);
    nodes[4].setPosition(canvasWidth * 0.78, canvasHeight * 0.28);
    nodes[5].setPosition(canvasWidth * 0.72, canvasHeight * 0.15);
  }
}
