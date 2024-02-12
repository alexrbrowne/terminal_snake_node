import chalk from 'chalk';
import readline from 'readline';

const height = 10;
const width = 20;
const verticalChar = chalk.blue('|');
const horizontalChar = chalk.blue('-');
const snakeChar = chalk.red('*');
const headChar = chalk.red('o');
const foodChar = chalk.green('&');
const log = console.log;
const snakePos = [height/2, width/2];
const foodPos = [];
const snakePositionHistory = []; // Older positions will be at the end of the array
const DIRECTIONS = {
    w: 'up',
    a: 'left', 
    s: 'down',
    d: 'right' 
  };
const foodScore = 100;

let highScore = 0;
let gameScore = 0;
let direction = "right";
let snakeLength = 0;
let gameInterval;


function drawHorizontals(size) {
    let row = " ";
    for(let i = 0; i < size; i ++) {
        row = row + horizontalChar;
    }
    log(chalk.blue(row));
}

function drawBox([snakePosY, snakePosX], [foodPosY, foodPosX]) {
    //20x10
    // | for the verticals
    // - for the horizontals
    //draw a box    

    const board = new Array(height).fill(null).map(() => new Array(width).fill(' '));
    
    // Snake head
    board[snakePosY][snakePosX] = headChar;
    // Snake body
    if (snakeLength != 0) {
        for (let i = 0; i < snakeLength; i++) {
            const [y, x] = snakePositionHistory[i];
            board[y][x] = snakeChar;
        }
    }

    // draw food
    if (foodPos.length > 0) {
        board[foodPosY][foodPosX] = foodChar;
    }

    // out the board
    log("");
    log(chalk.red("   SNAKE GAME v1.0"));
    log(" " + chalk.blue(horizontalChar.repeat(width)));
    log("");
    if (highScore > 0) {
        log(chalk.yellow(`HIGH SCORE: ${highScore}`));
    }
    log(chalk.yellow(`SCORE: ${gameScore}`));
    log(" " + chalk.blue(horizontalChar.repeat(width)));
    board.forEach((row) => {
        log(verticalChar + chalk.blue(row.join('')) + verticalChar);
    });
    log(" " + horizontalChar.repeat(width));
    // log(`DEBUG: snakeLength: ${snakeLength}`);
    // log(`DEBUG: snakeHistory: ${snakePositionHistory}`);
}


function handleInput(key) {

    if(!(key in DIRECTIONS)) {
      return; // Invalid input
    }
  
    const dir = DIRECTIONS[key];
  
    // Update snake direction
    direction = dir;
}

function moveSnake(dir) {
    switch(dir) {
      case 'up':
        // increment y pos
        snakePos[0] -= 1;
        break;
      
      case 'down':
        // decrement y pos
        snakePos[0] += 1;
        break;

      case 'left':
        // decrement x pos
        snakePos[1] -= 1;
        break;

      case 'right':
        // increment x pos
        snakePos[1] += 1;       
        break;
    } 

    return snakePos;
  }

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

function getUserInput() {
    // Return pressed key if any    
    
    return new Promise(resolve => {

        process.stdin.once("keypress", (key, evt) => {  
            resolve(key);
        });
    });
}


function getRandomPosition(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkPositionIsValid(snakeLength, snakePositionHistory, [posY, posX]) {
    let isValid = true;
    if (snakeLength != 0) {
        for (let i = 1; i < snakeLength - 1; i++) {
            const [y, x] = snakePositionHistory[i];
            if (y === posY && x === posX) {
                isValid = false;
                break;
            }
        }
    }

    return isValid;
}

function snakeEatFood([snakePosY, snakePosX]){
    if(foodPos.length === 0) {
        foodPos.push(getRandomPosition(0, height - 1));
        foodPos.push(getRandomPosition(0, width - 1));
    }

    if(snakePosY === foodPos[0] && snakePosX === foodPos[1]) {
        // Update score:
        gameScore += foodScore;

        // Update snake length:
        snakeLength ++;
        
        // Get new food position:
        foodPos.pop();
        foodPos.pop();
        foodPos.push(getRandomPosition(0, height - 1));
        foodPos.push(getRandomPosition(0, width - 1));
        while(!checkPositionIsValid(snakeLength, snakePositionHistory, foodPos)) {
            foodPos.pop();
            foodPos.pop();
            foodPos.push(getRandomPosition(0, height - 1));
            foodPos.push(getRandomPosition(0, width - 1));
        }
    }

    return gameScore;
}


function gameLoop(){
    //game loop

    gameInterval = setInterval(() => {
        console.clear();

        // Check if user pressed a key 
        (async () => {
            const key = await getUserInput();
            handleInput(key);
            
        })();

        // Update snake position
        snakePositionHistory.unshift([...snakePos]);
        moveSnake(direction);

        //  Check for food, update snake length, and relocate food
        snakeEatFood(snakePos);

        // Remove older positions that are not needed
        if (snakePositionHistory.length > snakeLength){
            snakePositionHistory.pop();
        }
      
        // Draw updated state
        drawBox(snakePos, foodPos);    
        gameScore ++;

        // LISA: lose condition
        result(snakePos);
        
      }, 1000); // repeat every 1 second
      
}

function result(snakePos) {
    // Check if snake is out of bounds
    if (snakePos[0] < 0 || snakePos[0] >= height || snakePos[1] < 0 || snakePos[1] >= width 
        || !checkPositionIsValid(snakeLength, [...snakePositionHistory].splice(1), snakePos)) {
      
        log(" ");
        log(chalk.magentaBright("You lose!"));
        clearInterval(gameInterval);

        if (highScore < gameScore) {
            highScore = gameScore;
            console.log(chalk.green(`New high score: ${highScore}`));
        } 

        rl.question("Press any key to start the game!", (answer) => {
            // reset the variables
            gameScore = 0;
            snakeLength = 0;
            snakePos[0] = height/2;
            snakePos[1] = width/2;
            main();
        });
    }
  }

function main() {
    log("Welcome to the snake game!");
    gameLoop();
}

main();