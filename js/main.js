'use strict'

var gBoard
var gStartTime
var gIntervalId
var gTbClickes
var gCountShown
var gCountMinesMarked
var isGameOver
var gMatSize = 16
var gNumRowCol = 4
var gMines = 2

function init() {
  isGameOver = false
  gBoard = buildBoard(gNumRowCol, gNumRowCol)
  renderBoard(gBoard)
  gTbClickes = 0
  gCountShown = 0
  gCountMinesMarked = 0
  console.log(gBoard)
}

function buildBoard(ROWS, COLS) {
  var board = []
  for (var i = 0; i < ROWS; i++) {
    board[i] = []
    for (var j = 0; j < COLS; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  return board
}

function renderBoard(board) {
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'

    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      var cellClass = getClassName({ i: i, j: j })

      currCell.isMine ? (cellClass += ' mine') : (cellClass += ' empty')

      strHTML += `<td class="cell ${cellClass}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="CellMarked(this,${i}, ${j});return false" >`

      if (currCell.isMine && currCell.isShown) {
        strHTML += '💣'
      } else if (currCell.isMine === false && currCell.isShown) {
        strHTML += currCell.minesAroundCount
      } else if (currCell.isMarked) {
        strHTML += '🚩'
      } else {
        strHTML += ' '
      }
      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }
  var elBoard = document.querySelector('.board')
  elBoard.innerHTML = strHTML
}

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function countNeighbors(cellI, cellJ, board) {
  var neighborsCount = 0
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue

      if (board[i][j].isMine) neighborsCount++
    }
  }
  return neighborsCount
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var currCell = board[i][j]
      currCell.minesAroundCount = countNeighbors(i, j, gBoard)
    }
  }
  return currCell.minesAroundCount
}

function cellClicked(elCell, i, j) {
  console.log('cell clicked', i, j, elCell)
  var cell = gBoard[i][j]
  gTbClickes++
  if (gTbClickes === 1) {
    startTimer()
    getRandomMineCell(gBoard, gMines, i, j)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
  }
  if (cell.isShown || isGameOver) return

  if (!cell.isShown && !cell.isMine) {
    cell.isShown = true
    gCountShown++
    if (cell.minesAroundCount === 0) {
      expandShown(gBoard, i, j)
    }
    renderBoard(gBoard)
    if (gCountShown === gMatSize - gMines && gCountMinesMarked === gMines)
      return victory()
  }

  if (cell.isMine === true) {
    ShowAllMines(gBoard)
    renderBoard(gBoard)
    return gameEnds()
  }
}

function CellMarked(elCell, i, j) {
  var cell = gBoard[i][j]
  gTbClickes++

  if (gTbClickes === 1) {
    startTimer()
    getRandomMineCell(gBoard, gMines, i, j)
    setMinesNegsCount(gBoard)
    renderBoard(gBoard)
  }
  if (cell.isShown || isGameOver) return

  if (cell.isMarked === true) {
    cell.isMarked = false
  } else {
    cell.isMarked = true
  }
  renderBoard(gBoard)
  if (cell.isMine) gCountMinesMarked++
  if (gCountShown === gMatSize - gMines && gCountMinesMarked === gMines)
    return victory()
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandomMineCell(gBoard, numOfMines, rowI, colJ) {
  for (var z = 1; z <= numOfMines; z++) {
    var i = getRandomInt(0, gBoard.length)
    var j = getRandomInt(0, gBoard[0].length)
    console.log('i-j random', i, j)
    if (!gBoard[i][j].isMine && gBoard[rowI][colJ] !== gBoard[i][j]) {
      gBoard[i][j].isMine = true
    } else {
      z--
    }
  }
  return renderBoard(gBoard)
}

function startTimer() {
  gStartTime = Date.now()
  gIntervalId = setInterval(updateTime, 80)
}

function updateTime() {
  var now = Date.now()
  var diff = now - gStartTime
  var secondsPast = diff / 1000
  var elTimerSpan = document.querySelector('.timer span')
  elTimerSpan.innerText = secondsPast.toFixed(3)
}

function gameEnds() {
  clearInterval(gIntervalId)
  var elRestartBtn = document.querySelector('.btn-restart')
  elRestartBtn.innerHTML = '☹️'
  isGameOver = true
}

function chooseLevel(numRowCol, mines) {
  gameEnds()
  gMatSize = numRowCol ** 2
  gNumRowCol = numRowCol
  gMines = mines
  RestartGame()
}

function victory() {
  gameEnds()
  var elRestartBtn = document.querySelector('.btn-restart')
  elRestartBtn.innerHTML = '🤩'
}

function resetTimer() {
  var elTimerSpan = document.querySelector('.timer span')
  elTimerSpan.innerText = ''
}

function RestartGame() {
  var elRestartBtn = document.querySelector('.btn-restart')
  if (elRestartBtn.innerHTML === '☹️' || elRestartBtn.innerHTML === '🤩') {
    elRestartBtn.innerHTML = '🙂'
    resetTimer()
    init()
  }
}

function expandShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (i === cellI && j === cellJ) continue
      if (j < 0 || j >= board[i].length) continue
      var currCell = board[i][j]
      if (!currCell.isShown && !currCell.isMarked) {
        currCell.isShown = true
        gCountShown++
        if (currCell.minesAroundCount === 0) {
          expandShown(gBoard, i, j)
        }
      }
    }
  }
  renderBoard(gBoard)
}

function ShowAllMines(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board.length; j++) {
      var currCell = board[i][j]

      if (currCell.isMine === true) {
        currCell.isShown = true
      }
    }
  }
  return renderBoard(gBoard)
}
