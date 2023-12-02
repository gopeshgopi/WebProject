

let solvability  
const challenge = []  
let themeChoice = 1  
let numRow = 4
let numCol = 4
let moves = 0
let playerTime
let rankCurr  
let solArray  
let dataArray  
let tiles
let blankTile
let uploadedImgSrc  
let observer  
const imgUrl = (x) => (challenge.includes(2) ? (x !== 5 ?  `url('assets/img-${x + 5}.jpg')` : `url('${uploadedImgSrc}')`) : `url('assets/img-${x}.jpg')`)

const arenaTable = document.querySelector('.arena__table')
const welcomePage = document.querySelector('.welcome')
const overlay = document.querySelector('.overlay')




class timer {
  constructor() {
    this.msec = 0
    this.sec = 0
    this.mins = 0
    this.run = true  
    this.totMsec = 0  
    this.time = ''  
  }
count(){
  if (this.run) {
    this.msec++
    this.totMsec++
    if (this.msec === 100) {
      this.sec++
      this.msec = 0
    }
    if (this.sec >= 60) {
      this.mins += Math.floor(this.sec/60)
      this.sec = this.sec % 60
    }
    this.time = `${('0'+this.mins).slice(-2)} : ${('0'+this.sec).slice(-2)} . ${this.msec}`
    document.querySelector('#time').textContent = this.time  
    document.querySelector('#moves').textContent = moves  
    setTimeout(this.count.bind(this), 10)  
  }
}
}

class userScore {
  constructor(timeInMsec, time, moves) {
    try {
      this.username = navigator.userAgentData.platform
    } catch (e) {  
      this.username = 'Captain Anonymous'
    }
    this.timeInMsec = timeInMsec
    this.time = time
    this.moves = moves
    this.size = `${numRow}*${numCol}`
    this.challenge = (challenge != []) ? '<= CHALLENGE =>' : ''
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    this.date = cDate + ' ' + cTime; 
}
}


function markCheckedOptions() {
  welcomePage.querySelectorAll('label').forEach(()=>{
    addEventListener('click', () => {
      document.querySelectorAll('.checkable-text').forEach(el => {
        el.checked ? document.querySelector('.' + el.id + '-label').style.color = 'gold' : document.querySelector('.' + el.id + '-label').style.color = 'aquamarine'
    })
    document.querySelectorAll('.checkable-pic').forEach(el => {
        el.checked ? document.querySelector('.' + el.id + '-label').style.outline = 'solid 1px gold' : document.querySelector('.' + el.id + '-label').style.outline = 'none'
    })
  })})
}

/**
 * 
 *
 * @param {object} e - 
 * @param {string} e.target.closest('.tile').dataset - The dataset of the closest tile element.
 * @return {undefined} 
 */
function setGamePage () {
  arenaTable.addEventListener('click', (e) => playTiles(e.target.closest('.tile').dataset))
  document.addEventListener('keydown', (e) => keyPressHandler(e))
  swipeHandler()
  document.querySelector('.pause').addEventListener('click', () => pauseOrResumeGame(playerTime))
  document.querySelector('.toggle-mode').addEventListener('click', toggleNumbers)
}


function setWelcomePage () {
  const howToPlayPage = document.querySelector('.how-to-play')
  document.querySelector('.welcome__proceed-start').addEventListener('click', startGame)
  document.querySelector('.welcome__proceed-start').addEventListener('click', playAudio)   
  document.querySelector('.back-to-welcome').addEventListener('click', () => {
    
    hideElement(welcomePage, false)
    hideElement(howToPlayPage)
  })
}

/**
 * 
 *
 * @param {HTMLElement} el 
 * @param {boolean} [hidden=true] 
 */
function hideElement(el, hidden = true) {
  hidden ? el.classList.add('hidden') : el.classList.remove('hidden')
}

/**
 * 
 *
 * @param {Array} array 
 * @param {boolean} solvable 
 * @return {Array} T
 */
function shuffleArray(array, solvable = true) {
  const getInversions = (arr) => {
    let inversions = 0
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === 0) continue
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] === 0) continue
        if (arr[i] > arr[j]) inversions++
      }
    }
    return inversions
  }
  
  const isSolvable = (arr) => {
    const inversions = getInversions(arr)
    const emptyTileRowFromBelow =
      numRow - Math.floor(arr.indexOf(0) / numCol)
    return (
      (numCol % 2 && inversions % 2 === 0) ||
      (numCol % 2 === 0 &&
        ((emptyTileRowFromBelow % 2 === 0 && inversions % 2 === 1) ||
          (emptyTileRowFromBelow % 2 === 1 && inversions % 2 === 0)))
    )
  }
  
  let arrayCopy = array.slice()
  do {
    arrayCopy.sort(() => Math.random() - 0.5)
  } while (solvable && !isSolvable(arrayCopy))  

  solvability = isSolvable(arrayCopy)
  return arrayCopy
}

/**
 * 
 *
 * @param {number} numRow 
 * @param {number} numCol 
 * @param {Array} dataArray 
 * @param {HTMLElement} arenaTable 
 * @param {timer} playerTime 
 * @return {void}
 */
function setArena() {
  let outputString = ''
  for(let i = 0; i < numRow; i++){
    outputString += '<tr>'
    for(let j = 0; j < numCol; j++){
      if (dataArray[i * numCol + j] === 0){
        outputString += `<td class="blank" data-row = ${i} data-col = ${j} data-value = 0 ></td>`
      } else {
        outputString += `<td class="tile" data-row = ${i} data-col = ${j} data-value = ${dataArray[i * numCol + j]} ><span class="tile__number hidden">` + dataArray[i * numCol + j] + '</span></td>'
      }
    }
    outputString += '</tr>\n'
  }
  arenaTable.innerHTML = outputString
  playerTime = new timer()
  playerTime.count()
  arenaTable.addEventListener('touchmove', e => e.preventDefault())
}

/**
 * 
 *
 * @param {Element} tile 
 * @param {number} step 
 * @param {string} axis 
 * @param {boolean} [animate=true] 
 */
function moveTile(tile, step, axis, animate = true) {
  axis === 'x' ? tile.dataset.col = Number(tile.dataset.col) - step : tile.dataset.row = Number(tile.dataset.row) - step
  let [x, y] = getTranslateXY(tile.style.transform)
  animate ? tile.classList.add('zoom-animation') : null
  tile.style.transform = (axis === 'x') ? `translateX(${x - 100*step}%) translateY(${y}%)` : tile.style.transform = `translateX(${x}%) translateY(${y-100*step}%)`
  setTimeout(() => {
    tile.classList.remove('zoom-animation')
  }, 225);
}

/**
 * 
 *
 * @param {string} s 
 * @return {Array<number>} 
 */
function getTranslateXY(s) {
  const regex = /translateX\(([-\d.]+)%\) translateY\(([-\d.]+)%\)/
  const matches = s.match(regex)
  if (matches) {
    const x = parseInt(matches[1])
    const y = parseInt(matches[2])
    return ([x, y])
  }
}

/**
 * 
 *
 * @param {number} x 
 * @param {number} y 
 * @return {Element} 
 */
function tileAtPos(x, y) {
  if (!(x >= 0 && x < numRow && y >= 0 && y < numCol)) {
    return
  }
  return document.querySelector(`[data-row="${x}"][data-col="${y}"]`)
}

/**
 * 
 * 
 * @param {Element.dataset} clickedTilePos 
 */
function playTiles(clickedTilePos) {
 
  if (!clickedTilePos) {
    return;
  }

  
  let targetMove = [
    1 * clickedTilePos.row - 1 * blankTile.dataset.row,
    1 * clickedTilePos.col - 1 * blankTile.dataset.col
  ];

  
  if (!targetMove[0] == !targetMove[1]) {
    return;
  } else if (targetMove[0]) {
  
    for (let i = Math.sign(targetMove[0]); Math.abs(i) <= Math.abs(targetMove[0]); i += Math.sign(targetMove[0])) {
      moveTile(tileAtPos(1 * blankTile.dataset.row + i, 1 * blankTile.dataset.col), Math.sign(targetMove[0]), 'y');
    }
    moveTile(blankTile, -targetMove[0], 'y', false);
  } else if (targetMove[1]) {
   
    for (let i = Math.sign(targetMove[1]); Math.abs(i) <= Math.abs(targetMove[1]); i += Math.sign(targetMove[1])) {
      moveTile(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + i), Math.sign(targetMove[1]), 'x');
    }
    moveTile(blankTile, -targetMove[1], 'x', false);
  }


  moves++;

 
  if (isWinnerMove()) {
    displayWin();
  }
}

/**
 * 
 *
 * @return {boolean} 
 */
function isWinnerMove() {
  for (let i = 0; i < numRow; i++) {
    for (let j = 0; j < numCol; j++) {
      if (tileAtPos(i, j).dataset.value != solArray[i * numCol + j]) {
        return false
      }
    }
  }
  return true
}


function displayWin() {
  hideElement(document.querySelector('.winner-alert'), false)
  hideElement(overlay, false)
  document.querySelector('.winner-alert__time').textContent = `${('0'+playerTime.mins).slice(-2)} : ${('0'+playerTime.sec).slice(-2)} . ${('0'+playerTime.msec).slice(-2)}`
  document.querySelector('.winner-alert__moves').textContent = moves
  playerTime.run = false
  rankCurr = new userScore(playerTime.totMsec, playerTime.time, moves)
  window.localStorage.setItem(`lbd-${window.localStorage.length}`, JSON.stringify(rankCurr))  
}

/**
 * 
 *
 * @param {KeyboardEvent} e 
 * @return {void} 
 */
function keyPressHandler(e) {
  window.addEventListener('keydown', e => {
    if (['ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
      e.preventDefault()  
    }
  })
  if (['ArrowDown','S', 's'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row + 1, 1 * blankTile.dataset.col).dataset)
  } else if (['ArrowUp','W', 'w'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row - 1, 1 * blankTile.dataset.col).dataset)
  } else if (['ArrowLeft','A', 'a'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col - 1).dataset)
  } else if (['ArrowRight','D', 'd'].includes(e.key)) {
    playTiles(tileAtPos(1 * blankTile.dataset.row, 1 * blankTile.dataset.col + 1).dataset)
  }
}

/**
 * 
 *
 * @param {type} e 
 * @return {type} 
 */
function swipeHandler() {
  let startX, startY, touchedTilePos;

  arenaTable.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    touchedTilePos = e.target.dataset;
  }); 

  arenaTable.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX);

    const isSameRow = touchedTilePos.row === blankTile.dataset.row;
    const isSameCol = touchedTilePos.col === blankTile.dataset.col;

    if (isHorizontalSwipe && isSameRow) {
      if (deltaX > 0 && touchedTilePos.col < blankTile.dataset.col) {
        playTiles(touchedTilePos);
      } else if (deltaX < 0 && touchedTilePos.col > blankTile.dataset.col) {
        playTiles(touchedTilePos);
      }
    } else if (isVerticalSwipe && isSameCol) {
      if (deltaY > 0 && touchedTilePos.row < blankTile.dataset.row) {
        playTiles(touchedTilePos);
      } else if (deltaY < 0 && touchedTilePos.row > blankTile.dataset.row) {
        playTiles(touchedTilePos);
      }
    }
  });
}

/**
 * 
 *
 * @param {object} timer 
 * @return {void} 
 */
function pauseOrResumeGame(timer) {
  if (timer.run) {
    timer.run = false
    hideAllTiles()
    setPauseButtonText('RESUME')
  } else {
    timer.run = true
    timer.count()
    showAllTiles()
    setPauseButtonText('PAUSE')
  }
}

function hideAllTiles() {
  tiles.forEach(tile => hideElement(tile))
}

function showAllTiles() {
  tiles.forEach(tile => hideElement(tile, false))
}

function setPauseButtonText(text) {
  document.querySelector('.pause').textContent = text
}

/**
 * 
 *
 * @param {Element} numberElement 
 * @return {void} 
 */
function toggleNumbers() {
  document.querySelectorAll('.tile__number').forEach(numberElement => {
    numberElement.classList.toggle('hidden')
  })
}

/**
 *  
 * 
 *
 * @return {Array} 
 */
function constructLeaderboard() {
  const leaderboard = []
  
  for (let i = 0; i < window.localStorage.length; i++) {
    const itemKey = `lbd-${i}`
    const storedItem = window.localStorage.getItem(itemKey)
    
    if (storedItem) {  
      leaderboard.push(JSON.parse(storedItem))
    }
  }
  
  leaderboard.sort((a, b) => {
    if (a.timeInMsec !== b.timeInMsec) {
      return a.timeInMsec - b.timeInMsec
    }
    
    return a.moves - b.moves
  })
  
  return leaderboard
}

/**
 * 
 *
 * @return {undefined} 
 */
function displayLeaderboard() {
  let leaderboard = constructLeaderboard()
  hideElement(document.querySelector('.leaderboard'), false)
  hideElement(document.querySelector('.winner-alert'))
  for (let i = 0; i < Math.min(3, leaderboard.length); i++) {
    document.querySelector(`.leaderboard__rank${i+1}-name`).textContent = leaderboard[i].username
    document.querySelector(`.leaderboard__rank${i+1}-time`).textContent = leaderboard[i].time
    document.querySelector(`.leaderboard__rank${i+1}-moves`).textContent = leaderboard[i].moves
    document.querySelector(`.leaderboard__rank${i+1}-date`).textContent = leaderboard[i].date
    document.querySelector(`.leaderboard__rank${i+1}-size`).textContent = leaderboard[i].size
    document.querySelector(`.leaderboard__rank${i+1}-cmode`).textContent = leaderboard[i].challenge
  }
}

/**
 * 
 *
 * @return {undefined}
 */
function loadImgToArena() {
  let x = 2
  let clickablePics = document.querySelectorAll('.checkable-pic')
  for (let i = 1; i <= clickablePics.length; i++) {
    if (clickablePics[i-1].checked) {
      x = i
      break
    }
  }
  x === 5 ? document.querySelectorAll('.tile__number').forEach(numEl => hideElement(numEl, false)) : 0
  const tileArray = Array.from(document.querySelectorAll('.tile'))
  tileArray.forEach((tile) => {
    const tileRow = Math.floor((1*tile.dataset.value - 1)/ numCol)
    const tileCol = (1*tile.dataset.value -1) % numCol
    tile.style.backgroundImage = imgUrl(x)
    tile.style.backgroundPosition = `${tileCol * 100/(numCol-1)}% ${tileRow * 100/(numRow-1)}%`
  })
  loadUserImg()
}



function playAudio(){
  document.getElementById("my_audio").play();
}



function startGame() {
  setGamePage()
  
  numRow = document.getElementById('boardsize-row').value
  numCol = document.getElementById('boardsize-col').value

  document.querySelectorAll('.challenge-option').forEach((el, index) => {
    el.checked ? challenge.push(index + 1) : 0
  })

  document.querySelectorAll('.theme-option').forEach((el, index) => {
    el.checked ? (themeChoice = index + 1) : 0
  })

  solArray = Array.from({length: numRow * numCol - 1}, (_, k) => k + 1);  solArray.push(0)
  dataArray = shuffleArray(solArray, !challenge.includes(3))

  setArena()

  tiles = document.querySelectorAll('.tile')
  blankTile = document.querySelector('.blank')

  tiles.forEach(tile => tile.style.transform = 'translateX(0%) translateY(0%)')
  blankTile.style.transform = 'translateX(0%) translateY(0%)'

  loadImgToArena()

  hideElement(welcomePage)
  hideElement(overlay)

  setTheme()
  executeChallenges()
}

/**
 * 
 *
 * @return {void} 
 */
function freezeRandomTiles() {
  const tiles = Array.from(document.querySelectorAll('.tile'))
  const frozenTiles = []


  while (frozenTiles.length < Math.floor(numRow*numCol/5)) {
    const randomIndex = Math.floor(Math.random() * tiles.length)
    if (!frozenTiles.includes(randomIndex)) {
      frozenTiles.push(randomIndex)
    }
  }

  
  frozenTiles.forEach(index => {
    tiles[index].classList.add('frozen')
      observer.observe(tiles[index], { attributes: true })
  })


  setTimeout(() => {
    frozenTiles.forEach(index => {
      tiles[index].classList.remove('frozen')
    })
    
    observer.disconnect()
  }, 10000)

}

/**
 * 
 *
 * @param {number} timeInSec 
 * @param {number} move 
 */
function imposePenalty(timeInSec, move) {
  playerTime.totMsec += timeInSec * 100
  playerTime.sec += timeInSec
  moves += move
}


function challengeLevel2() {
  if (challenge.includes(2)) {
  
    document.getElementById('boardsize-row').min = 5
    document.getElementById('boardsize-row').value = 5
    document.getElementById('boardsize-col').min = 5
    document.getElementById('boardsize-col').value = 5
    
    for (let i = 1; i < 5; i++) {
      document.querySelector(`.pic${i}-label`).src = `assets/img-${i + 5}.jpg`
    }

    document.querySelector('#imageUploader').htmlFor = 'uploadedImg-pic'
    document.querySelector(`.pic5-label`).src = 'assets/img-10-c.jpg'

  } else {
  
    document.getElementById('boardsize-row').min = 2
    document.getElementById('boardsize-row').value = 4
    document.getElementById('boardsize-col').min = 2
    document.getElementById('boardsize-col').value = 4

    for (let i = 1; i < 5; i++) {
      document.querySelector(`.pic${i}-label`).src = `assets/img-${i}.jpg`
    }
   
    document.querySelector('#imageUploader').htmlFor = 'pic-5'
    document.querySelector(`.pic5-label`).src = 'assets/img-5-c.jpg'
  }

}

/**
 * 
 *
 * @param {None} No 
 * @return {None} 
 */
function challengeImpossible() {
  const surrenderButton = document.querySelector('.surrender')
  hideElement(surrenderButton, false)
  surrenderButton.addEventListener('click', () => {
    if (solvability) {
      if(!alert('Puzzle was solvable! :-(')) {
        window.location.reload()
      }
    } else {
      displayWin()
    }
  })
}

function executeChallenges() {
  
  if (challenge.includes(1)) {
    observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        
        if (
          mutation.attributeName === 'data-row' ||
          mutation.attributeName === 'data-col'
        ) {
          imposePenalty(10, 2)
        }
      })
    })
    setInterval(freezeRandomTiles, 15000)
  }
  
  
  if (challenge.includes(3)) {
    challengeImpossible()
  }
}

/**
 * 
 *
 * @param {number} themeChoice 
 */
function setTheme() {
  const bodyStyle = document.body.style
  if (themeChoice == 2) {
    bodyStyle.fontFamily = "'Press Start 2P', cursive"
    bodyStyle.backgroundColor = 'black'
    bodyStyle.backgroundImage = 'none'
    bodyStyle.color = 'white'
  } else if (themeChoice == 3) {
    bodyStyle.fontFamily = "'Lato', sans-serif"
    bodyStyle.backgroundImage = "url('assets/bg-3.jpg')"
  }
}


function loadUserImg() {
  window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        
        document.querySelector('#pic5').checked = true
        if (this.files && this.files[0]) {
            uploadedImgSrc = URL.createObjectURL(this.files[0])
        }
    })
  })
}


loadUserImg()
setWelcomePage()
markCheckedOptions()