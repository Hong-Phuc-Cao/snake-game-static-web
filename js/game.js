const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
const scoreElement = document.getElementById('score')
const restartBtn = document.getElementById('restartBtn')

const urlParams = new URLSearchParams(window.location.search);
const difficulty = urlParams.get('difficulty')
const gameOverSound = new Audio('../assets/failureSound.mp3')
gameOverSound.playbackRate = 2.0

let hasPoison
let speed
if (difficulty === 'easy') {
    speed = 200
} else if (difficulty === 'medium') {
    speed = 150
} else if (difficulty === 'hard') {
    speed = 100
    hasPoison = true
} else if (difficulty === 'Asian') {
    speed = 50
    hasPoison = true
} else {
    console.log('No difficulty found');
}

const gridSize = 20
const tileCount = canvas.width / gridSize

let snake = [{
    x: 10,
    y: 10
}]

let food = {
    x: 0,
    y: 0,
}

let poison = hasPoison ? {
    x: 0,
    y: 0,
} : null

generateFood()
if (hasPoison) {
    generatePoison()
}

let dx = 0
let dy = 0
let score = 0
let gameLoop;
let gameOver = false;

function drawGame() {
    //console.log('ctx: ', ctx);
    //console.log('Speed:', speed);
    if (!ctx) {
        console.log('Canvas not available');
        endGame()
        return
    }

    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    snake.forEach(segment => {
        ctx.fillStyle = '#10b981'
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2)
    })

    ctx.fillStyle = '#ef4444'
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2)

    if (hasPoison) {
        ctx.fillStyle = '#86007d'
        ctx.fillRect(poison.x * gridSize, poison.y * gridSize, gridSize - 2, gridSize - 2)
    }

    if (!gameOver) {
        if (dx !== 0 || dy !== 0) {
            const head = {
                x: snake[0].x + dx,
                y: snake[0].y + dy
            }

            snake.unshift(head)

            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                console.log('collide w wall -> endGame');
                endGame()
                return
            }

            if (snake.slice(1).some(segment => segment.x == head.x && segment.y == head.y)) {
                console.log('collide w itself -> endGame');
                endGame()
                return
            }
            if (head.x === food.x && head.y === food.y) {
                score += 1
                scoreElement.textContent = score
                generateFood()
                generatePoison()
            } else {
                snake.pop()
            }
            if (head.x === poison.x && head.y === poison.y) {
                endGame()
                return
            }
        }
    }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount)
    food.y = Math.floor(Math.random() * tileCount)
    if (snake.some(segment => segment.x === food.x && segment.y === food.y) ||
        (hasPoison && poison && food.x === poison.x && food.y === poison.y)) {
        generateFood();
    }
}

function generatePoison() {
    if (hasPoison) {
        poison.x = Math.floor(Math.random() * tileCount);
        poison.y = Math.floor(Math.random() * tileCount);

        if (snake.some(segment => segment.x === poison.x && segment.y === poison.y) ||
            (food.x === poison.x && food.y === poison.y)) {
            generatePoison();
        }
    }
}

function endGame() {
    gameOver = true;
    clearInterval(gameLoop);
    restartBtn.classList.remove('hidden');
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    if (score <= 3) {
        ctx.fillText('YOU FAILURE!', canvas.width / 2, canvas.height / 2);
        try {
            gameOverSound.play()
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    } else {
        ctx.fillText('Game over!', canvas.width / 2, canvas.height / 2);
    }

}

function resetGame() {
    console.log('Restart button clicked!');
    console.log('Title count: ', tileCount);

    let speed
    if (difficulty === 'easy') {
        speed = 200
    } else if (difficulty === 'medium') {
        speed = 150
    } else if (difficulty === 'hard') {
        speed = 100
        hasPoison = true
    } else if (difficulty === 'Asian') {
        speed = 50
        hasPoison = true
    } else {
        console.log('No difficulty found');
    }

    snake = [{
        x: 10,
        y: 10
    }];

    generateFood()
    generatePoison()

    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameOver = false;
    restartBtn.classList.add('hidden');
    gameLoop = setInterval(drawGame, speed);
}

document.addEventListener('keydown', e => {
    if (gameOver)
        return
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            if (dy !== 1) {
                dx = 0;
                dy = -1
            }
            console.log('Up');
            break
        case 's':
        case 'ArrowDown':
            if (dy !== -1) {
                dx = 0;
                dy = 1
            }
            console.log('Down');
            break
        case 'a':
        case 'ArrowLeft':
            if (dx !== 1) {
                dx = -1;
                dy = 0
            }
            console.log('Left');
            break
        case 'd':
        case 'ArrowRight':
            if (dx !== -1) {
                dx = 1;
                dy = 0
            }
            console.log('Right');
            break
    }
})

restartBtn.addEventListener('click', resetGame)
gameLoop = setInterval(drawGame, speed)