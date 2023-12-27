const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const exitBtn = document.getElementById('exitButton');
const startBtn = document.getElementById('startButton');
const playBtn = document.getElementById('playButton');
const startWindow = document.getElementById('startWindow');
const mainArea = document.getElementById('mainArea');
const genTime = document.getElementById('genTime');

let allObjects = [];
let colNumber, rowNumber, animId;

startBtn.addEventListener('click', openMainArea);
exitBtn.addEventListener('click', closeMainArea);
playBtn.addEventListener('click', playGame);
canvas.addEventListener('click', changeCellStatus);

/**
 * Representation of a filed single cell 
 */
class Cell {
    constructor (ctx, cNum, rNum, width, height, bColor, color, opt) {
        this.ctx = ctx;
        this.cNum = cNum;
        this.rNum = rNum;
        this.height = height;
        this.width = width;
        this.xPos = this.cNum * this.width + this.width/2;
        this.yPos = this.rNum * this.height + this.height / 2;
        this.bColor = bColor;
        this.color = color; 
        this.isAlive = opt && (Math.random() > 0.5);   
    }

    /**
     * draw a cell
     * if it is not alive the is not filled
     * otherwise the method fills the circle with given color
     */
    drawCell() {
        this.drawCircle();
        if (this.isAlive) {
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        } else {
            this.ctx.stroke();
        }
    }

    /**
     * draw a circle
     */
    drawCircle() {
        const startAngle = (Math.PI / 180) * 0;
        const endAngle = (Math.PI / 180) * 360;
        this.ctx.lineWidth=10;
        this.ctx.beginPath();
        this.ctx.arc(this.xPos, this.yPos, this.height/3, startAngle, endAngle, false);
    }

    /**
     * change a life status
     */
    changeLiveStatus() {
        this.isAlive = !this.isAlive;
        this.drawCell();
    }
}

/**
 * create game field and draw all cells depending on option
 * chosen by user
 * close start window
 */
function openMainArea() {
    startWindow.style.display = 'none';
    mainArea.style.display = 'flex';

    colNumber = parseInt(document.getElementById('size-column').value);
    rowNumber = parseInt(document.getElementById('size-row').value);

    const options = document.getElementsByName('startOpt');
    let val;
    for(let i = 0; i < options.length; i++){
        if(options[i].checked){
            val = options[i].value;
            break;
        }
    }

    const isRandom = val === '1' ? true : false;

    createField(allObjects, rowNumber, colNumber, isRandom);

    allObjects.forEach(e => e.drawCell());
}

/**
 * finish the game when user clicked on exit button
 * show the start modal window
 */
function closeMainArea() {
    cancelAnimationFrame( animId );
    allObjects = [];
    colNumber, rowNumber, animId = undefined;

    genTime.innerText = ``;

    startWindow.style.display = 'block';
    mainArea.style.display = 'none';
}

/**
 * adjust canvas size and fill the game field with first generation data
 * @param {Array} arr array to store all cells
 * @param {Number} row number of rows
 * @param {Number} col number of columns
 * @param {Boolean} isRandom option to fill the game field
 */
function createField(arr, row, col, isRandom) {
    const k = canvas.width / canvas.height;
    if (k > 1) {
        canvas.width = 15000;
        canvas.height = 15000 / k;
    } else {
        canvas.height = 15000;
        canvas.width = 15000 / k;
    }
 
    const x = canvas.width / col;
    const y = canvas.height / row;


    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            arr.push(new Cell(context, j, i, x, y, '#000', '#b805fc', isRandom));
        }
    }
}

/**
 * get cell coordinates and check if the cell is alive
 * @param {Number} colNum current column number
 * @param {Number} rowNum current row number
 * @returns {Number} 1 - if the cell is alive and 0 - if it is not
 */
function isAlive(colNum, rowNum) {

    if (colNum === -1) colNum = colNumber - 1;
    if (colNum === colNumber) colNum = 0;
    if (rowNum === -1) rowNum = rowNumber - 1;
    if (rowNum === rowNumber) rowNum = 0;

    const index = getCellIndex(colNum, rowNum);

    return allObjects[index].isAlive ? 1 : 0;
}

/**
 * get row and column numbers of a cell and return it index in 
 * allObjects array
 * @param {Number} c 
 * @param {Number} r 
 * @returns {Number} index of a cell with given coordinates
 */
function getCellIndex(c, r) {
    return c + (r * colNumber);
}

/**
 * get a cell by coords in px
 * @param {Number} x coords in px
 * @param {Number} y coords in px
 * @returns {Object} cell
 */
function findCellByCoords(x, y) {
    return allObjects.find(e => e.xPos - e.width < x && e.xPos + e.width > x && e.yPos - e.height < y && e.yPos + e.height > y);
}

/**
 * change cell status when user clicks on it
 * @param {Event} e 
 */
function changeCellStatus(e) {
    const mouseX = e.clientX + 70;
    const mouseY = e.clientY - 80;
    const k1 = canvas.width / canvas.clientWidth;
    const k2 = canvas.height / canvas.clientHeight;

    const cell = findCellByCoords(mouseX*k1, mouseY*k2);
    cell.changeLiveStatus();
}

/**
 * check all cells and change their life status
 */
function updateCellAliveStatus() {
    if (!allObjects.length) return
    // go through all cells
    for (let i = 0; i < colNumber; i++) {
        for (let j = 0; j < rowNumber; j++) {
            // calculate alive neighbor cells
            let aliveCells = isAlive(i - 1, j - 1) + isAlive(i, j - 1) + isAlive(i + 1, j - 1) + isAlive(i - 1, j) + isAlive(i + 1, j) + isAlive(i - 1, j + 1) + isAlive(i, j + 1) + isAlive(i + 1, j + 1);
            // get cell index in allObject array
            let index = getCellIndex(i, j);
            // if number of alive neighbors equals 2
            // life status of the cell won't be changed
            if (aliveCells === 2) {
                continue;
            // if number of alive neighbors equals 3
            // the cell will become alive
            } else if (aliveCells === 3) {
                allObjects[index].isAlive = true;
            // otherwise it will die
            } else {
                allObjects[index].isAlive = false;
            }
        }
    }
}

/**
 * main game loop
 */
function gameLoop() {
    if (!allObjects.length) return
    // check perfomance
    const startTime = performance.now();


    // calculate a new cell alive status
    updateCellAliveStatus();

    // remove all drawings from the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // draw all cell with new alive status
    for (let i = 0; i < allObjects.length; i++) {
        allObjects[i].drawCell();
    }
    // show perfomance
    const endTime = performance.now();

    genTime.innerText = `Time to build a new generation: ${(endTime - startTime).toFixed(2)} s`

    setTimeout( () => {
        animId = window.requestAnimationFrame(() => gameLoop());
    }, 700)
}

/**
 * run the game when user press Play button
 */
function playGame() {
    window.requestAnimationFrame(() => gameLoop());
}
