const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win'),
    mines: document.getElementById("mines"),
    battingAmount: document.getElementById("bet_amount"),
    profitMultiplier: document.getElementById("profit-multiplier"),
    totalProfit: document.getElementById("total-profit"),
    cashout: document.getElementById("cashout"),
    lost: document.getElementById("lost"),
    profit: document.getElementById("profit")
}
const k = 0.1;  // Increase per mine
const l = 0.1; // Increase per tile flipped
const state = {
    gameStarted: false,
    flippedCards: 0,
    totatProfit: 1,
    loop: null,
    gameOver: false,
    mines: 1,
    battingAmount: 1,
}
function handleBet() {
    if (state.gameStarted) {
        cashOut()
    }
    else if (state.gameOver) {
        startGame()
    }
    else {
        startGame()
    }

}
const shuffle = array => {
    const clonedArray = [...array]

    for (let index = clonedArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const original = clonedArray[index]

        clonedArray[index] = clonedArray[randomIndex]
        clonedArray[randomIndex] = original
    }

    return clonedArray
}
function calculateProfitMultiplier(mines, tilesFlipped) {
    const mineFactor = 1 + (mines * k);
    const tileFactor = 1 + (tilesFlipped * l);
    return parseFloat((mineFactor * tileFactor).toFixed(2));
}
const generateGame = ({ mines }) => {
    const dimensions = selectors.board.getAttribute('data-dimension')

    const minesArr = new Array(mines).fill("💣")
    const diamondsArr = new Array(25 - mines).fill("💎")
    console.log(minesArr.length, diamondsArr.length)
    const items = shuffle([...diamondsArr, ...minesArr])
    const cards = `
        <div class="board" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
       </div>
    `


    selectors.boardContainer.innerHTML = cards
}
const cashOut = () => {
    selectors.cashout.style.display = "block";
    selectors.profitMultiplier.innerText = `${state.totatProfit}x`;
    selectors.totalProfit.innerText = `₹ ${(state.totatProfit * state.battingAmount).toFixed(2)}`;
    //game over script
    state.gameOver = true
    state.gameStarted = false
    selectors.start.innerText = "Bet"
    selectors.start.disabled = false
}
const startGame = () => {
    state.gameStarted = true
    state.gameOver = false
    selectors.lost.style.display = "none"
    selectors.cashout.style.display = "none"
    selectors.start.innerText = "Cash Out"
    selectors.start.disabled = true
    const mines = parseInt(selectors.mines.value)
    const battingAmount = parseInt(selectors.battingAmount.value)
    state.mines = mines
    state.battingAmount = battingAmount
    generateGame({ mines })
}
const gameOver = () => {
    state.gameOver = true
    state.gameStarted = false
    state.totatProfit = 1
    selectors.profit.innerText = state.totatProfit
    selectors.start.innerText = "Bet"
    selectors.start.disabled = false

}
const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped')
    })

    state.flippedCards = 0
}
const wait = (time) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(true)
        }, time);
    })
}
const flipCard = async card => {
    state.flippedCards++
    state.totalFlips++

    card.classList.add('flipped')
    if (card.innerText === "💣") {
        gameOver()
        selectors.lost.style.display = "block"
        setTimeout(async () => {
            for (let i = 0; i <= 25; i++) {
                await wait(50)
                document.querySelectorAll('.card')[i].classList.add('flipped')
            }
        }, 1000)
        await wait(1000)
        selectors.start.disabled = false
    }
    else {
        state.totatProfit = calculateProfitMultiplier(state.mines, state.flippedCards)
        selectors.profit.innerText = state.totatProfit
        selectors.start.disabled = false
        document.getElementById("total_profit").value = (state.totatProfit * state.battingAmount).toFixed(2)
    }
    // If there are no more cards that we can flip, we won the game
    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped')
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `

            clearInterval(state.loop)
        }, 1000)
    }
}

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target
        const eventParent = eventTarget.parentElement

        if (!state.gameOver && state.gameStarted) {
            if (eventTarget.className.includes('card') && !eventParent.className.includes('flipped')) {
                flipCard(eventParent)
            }
        }
    })
}
generateGame({ mines: 1 })
attachEventListeners()