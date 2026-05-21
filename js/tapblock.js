const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRID = 40;

const COLORS = [
    "#ff4d4d",
    "#4da6ff",
    "#4dff88",
    "#ffd24d",
    "#d24dff",
    "#ff914d"
];

let level = 1;
let score = 0;
let lives = 3;

const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const livesEl = document.getElementById("lives");

const leftWall = [];
const rightWall = [];

const wallWidth = 2;

let speed = 2;
let flashTimer = 0;
let spawnTimer = 0;
const activeBlocks = [];
let frame = 0;

function getLevelColorCount() {
    return Math.min(2 + (level - 1), COLORS.length);
}

function createWall() {

    leftWall.length = 0;
    rightWall.length = 0;

    const colorCount = getLevelColorCount();
    const segmentHeight = canvas.height / colorCount;

    for(let i=0;i<colorCount;i++){

        leftWall.push({
            color: COLORS[colorCount - 1 - i],
            y: i * segmentHeight,
            height: segmentHeight
        });

        rightWall.push({
            color: COLORS[i],
            y: i * segmentHeight,
            height: segmentHeight
        });
    }
}

createWall();

class Block {

    constructor(x = canvas.width / 2 - GRID / 2, y = -GRID, controlled = false){

        const colorCount = getLevelColorCount();

        this.size = GRID;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = speed;
        this.controlled = controlled;
        this.trail = [];

        this.colorIndex = Math.floor(Math.random() * colorCount);
        this.color = COLORS[this.colorIndex];

        this.landed = false;
    }

    update(){
        if(this.landed) return;

        if(this.vx !== 0 || this.vy !== 0){
            this.trail.push({x: this.x, y: this.y});
            if(this.trail.length > 12) this.trail.shift();
        }

        this.x += this.vx;
        this.y += this.vy;
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.size));

        if(this.y + this.size >= canvas.height){

            this.triggerError();
            return;
        }

        const onLeftSide = this.x <= wallWidth * GRID;
        const onRightSide = this.x + this.size >= canvas.width - wallWidth * GRID;

        for(const block of placedBlocks){

            if(this.x < block.x + block.size &&
               this.x + this.size > block.x &&
               this.y < block.y + block.size &&
               this.y + this.size > block.y){

                if(block.color !== this.color){
                    this.triggerError();
                    return;
                }

                const rowY = snapRow(block.y);
                if(block.x < canvas.width / 2){
                    this.x = getNextLeftX(rowY);
                }
                else{
                    this.x = getNextRightX(rowY);
                }
                this.y = rowY;
                this.vx = 0;
                this.landed = true;
                return;
            }
        }

        if(onLeftSide){

            const segment = getWallSegment(leftWall, this.y);
            const rowY = snapRow(this.y);

            if(segment.color === this.color){
                this.x = getNextLeftX(rowY);
                this.y = rowY;
                this.vx = 0;
                this.landed = true;
                return;
            }
            else{
                this.triggerError();
                return;
            }
        }

        if(onRightSide){

            const segment = getWallSegment(rightWall, this.y);
            const rowY = snapRow(this.y);

            if(segment.color === this.color){
                this.x = getNextRightX(rowY);
                this.y = rowY;
                this.vx = 0;
                this.landed = true;
                return;
            }
            else{
                this.triggerError();
                return;
            }
        }
    }

    draw(){

        if(this.trail && this.trail.length){
            for(let i = 0; i < this.trail.length; i++){
                const point = this.trail[i];
                const alpha = (i + 1) / this.trail.length * 0.35;
                ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${alpha})`;
                ctx.fillRect(point.x, point.y, this.size, this.size);
            }
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x + 2, this.y + 2, this.size - 4, this.size - 4);
    }

    triggerError(){
        flashScreen();
        loseLife(false);
        this.vx = 0;
        this.landed = true;
    }
}

function getWallSegment(wall, y){

    for(const seg of wall){

        if(y >= seg.y && y <= seg.y + seg.height){
            return seg;
        }
    }

    return wall[0];
}

function snapRow(y){
    const row = Math.round(y / GRID);
    return Math.max(0, Math.min(row, Math.floor((canvas.height - GRID) / GRID))) * GRID;
}

function hexToRgb(hex){
    const cleaned = hex.replace('#','');
    const bigint = parseInt(cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
}

function getNextLeftX(rowY){
    const rowBlocks = placedBlocks.filter(b => b.y === rowY && b.x >= wallWidth * GRID && b.x < canvas.width / 2);
    if(rowBlocks.length === 0){
        return wallWidth * GRID;
    }
    return Math.max(...rowBlocks.map(b => b.x)) + GRID;
}

function getNextRightX(rowY){
    const rowBlocks = placedBlocks.filter(b => b.y === rowY && b.x <= canvas.width - wallWidth * GRID - GRID && b.x >= canvas.width / 2);
    if(rowBlocks.length === 0){
        return canvas.width - wallWidth * GRID - GRID;
    }
    return Math.min(...rowBlocks.map(b => b.x)) - GRID;
}

function spawnRandomBlock(){
    const minX = wallWidth * GRID;
    const maxX = canvas.width - wallWidth * GRID - GRID;
    const availableColumns = Math.floor((maxX - minX) / GRID) + 1;
    const x = minX + Math.floor(Math.random() * availableColumns) * GRID;
    activeBlocks.push(new Block(x, -GRID, false));
}

function assignControlledBlock(exclude = null){
    const candidates = activeBlocks.filter(b => !b.landed && b !== exclude).concat([]);

    if(currentBlock && !currentBlock.landed && currentBlock !== exclude){
        candidates.push(currentBlock);
    }

    if(candidates.length === 0){
        currentBlock = new Block(canvas.width / 2 - GRID / 2, -GRID, true);
        return;
    }

    let lowest = candidates.reduce((a,b) => (a.y > b.y ? a : b));

    if(lowest !== currentBlock){
        if(currentBlock && !currentBlock.landed && currentBlock !== exclude){
            activeBlocks.push(currentBlock);
        }

        const idx = activeBlocks.indexOf(lowest);
        if(idx !== -1) activeBlocks.splice(idx,1);

        currentBlock = lowest;
        currentBlock.controlled = true;
    } else {
        currentBlock = lowest;
        currentBlock.controlled = true;
    }
}

let currentBlock = new Block(canvas.width / 2 - GRID / 2, -GRID, true);
const placedBlocks = [];

function drawWalls(){

    for(let i=0;i<leftWall.length;i++){

        const seg = leftWall[i];
        ctx.fillStyle = seg.color;
        ctx.fillRect(
            0,
            seg.y,
            wallWidth * GRID,
            seg.height
        );

        if(i < leftWall.length - 1){
            ctx.fillStyle = "black";
            ctx.fillRect(0, seg.y + seg.height - 5, wallWidth * GRID, 10);
        }
    }

    for(let i=0;i<rightWall.length;i++){

        const seg = rightWall[i];
        ctx.fillStyle = seg.color;
        ctx.fillRect(
            canvas.width - wallWidth * GRID,
            seg.y,
            wallWidth * GRID,
            seg.height
        );

        if(i < rightWall.length - 1){
            ctx.fillStyle = "black";
            ctx.fillRect(canvas.width - wallWidth * GRID, seg.y + seg.height - 5, wallWidth * GRID, 10);
        }
    }
}

function updateUI(){

    scoreEl.innerText = score;
    levelEl.innerText = level;
    livesEl.innerText = lives;
}

function loseLife(resetBlock = true){
    lives -= 1;
    updateUI();

    if(lives <= 0){
        gameOver();
        return;
    }

    if(resetBlock){
        currentBlock = new Block(canvas.width / 2 - GRID / 2, -GRID, true);
    }
}

function flashScreen(){
    flashTimer = 10;
}

function gameOver(){

    alert("Game Over!\nPunkte: " + score);

    location.reload();
}

function update(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawWalls();

    for(const block of placedBlocks){
        block.draw();
    }

    spawnTimer -= 1;
    if(spawnTimer <= 0){
        if(activeBlocks.length < 4){
            spawnRandomBlock();
        }
        spawnTimer = 40 + Math.floor(Math.random() * 40);
    }

    for(let i = activeBlocks.length - 1; i >= 0; i--){
        const block = activeBlocks[i];
        block.update();
        block.draw();

        if(block.landed){
            placedBlocks.push(block);
            activeBlocks.splice(i, 1);
        }
    }

    currentBlock.update();
    currentBlock.draw();

    frame++;
    if(currentBlock && !currentBlock.landed){
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.15);
        const alpha = 0.5 + 0.4 * Math.abs(Math.sin(frame * 0.15));
        const lineW = 4 + 2 * Math.abs(Math.sin(frame * 0.15));
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth = lineW;
        ctx.strokeRect(currentBlock.x + 2, currentBlock.y + 2, currentBlock.size - 4, currentBlock.size - 4);
    }

    if(currentBlock.landed){
        placedBlocks.push(currentBlock);
        score += 10;

        if(score % 100 === 0){
            level++;
            speed += 0.4;
            createWall();
        }

        updateUI();
        assignControlledBlock();
    }

    if(flashTimer > 0){
        ctx.fillStyle = "rgba(255,0,0,0.25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashTimer -= 1;
    }

    requestAnimationFrame(update);
}

window.addEventListener("keydown", e => {

    if(e.repeat) return;

    if(e.key === "ArrowLeft"){
        e.preventDefault();
        if(currentBlock && !currentBlock.landed){
            currentBlock.vx = -6;
            currentBlock.controlled = false;
            const launched = currentBlock;
            activeBlocks.push(launched);
            assignControlledBlock(launched);
        }
    }

    if(e.key === "ArrowRight"){
        e.preventDefault();
        if(currentBlock && !currentBlock.landed){
            currentBlock.vx = 6;
            currentBlock.controlled = false;
            const launched = currentBlock;
            activeBlocks.push(launched);
            assignControlledBlock(launched);
        }
    }

    if(e.key === "ArrowDown"){
        e.preventDefault();
        if(currentBlock && !currentBlock.landed){
            currentBlock.vy = speed * 2;
        }
    }
});

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    createWall();
});

updateUI();
update();
