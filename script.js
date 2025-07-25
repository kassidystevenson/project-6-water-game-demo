// Game configuration and state variables
const GOAL_CANS = 25;        // Total items needed to collect
let currentCans = 0;         // Current number of items collected
let gameActive = false;      // Tracks if game is currently running
let spawnInterval;          // Holds the interval for spawning items
const OBSTACLE_TYPES = [
  { class: 'decoy-bottle', label: 'Decoy Bottle' },
  { class: 'penalty-sign', label: 'Penalty Sign' }
];
const MILESTONES = [5, 10, 15, 20, 25];
let timer = 30;
let timerInterval;

// Difficulty settings
const DIFFICULTY_SETTINGS = {
  easy: {
    winCondition: 5,
    timeLimit: 40,
    decoyCount: 2
  },
  normal: {
    winCondition: 10,
    timeLimit: 30,
    decoyCount: 3
  },
  hard: {
    winCondition: 15,
    timeLimit: 20,
    decoyCount: 5
  }
};

let currentDifficulty = 'easy';
let winCondition = DIFFICULTY_SETTINGS.easy.winCondition;
let timeLimit = DIFFICULTY_SETTINGS.easy.timeLimit;
let decoyCount = DIFFICULTY_SETTINGS.easy.decoyCount;

// Creates the 3x3 game grid where items will appear
function createGrid() {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = ''; // Clear any existing grid cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell'; // Each cell represents a grid square
    grid.appendChild(cell);
  }
}

// Ensure the grid is created when the page loads
createGrid();

// Utility to show feedback messages
function showFeedback(msg, type = '') {
  const feedback = document.getElementById('feedback-message');
  feedback.textContent = msg;
  feedback.className = 'feedback-message ' + type;
  setTimeout(() => {
    feedback.textContent = '';
    feedback.className = 'feedback-message';
  }, 800);
}

// Utility to show milestone celebrations
function showMilestone(milestone) {
  const achievements = document.getElementById('achievements');
  achievements.textContent = `🎉 Milestone: ${milestone} cans! 🎉`;
  achievements.style.display = 'block';
  setTimeout(() => {
    achievements.textContent = '';
    achievements.style.display = 'none';
  }, 1200);
}

// Update score display
function updateScore() {
  document.getElementById('current-cans').textContent = currentCans;
  if (MILESTONES.includes(currentCans)) {
    showMilestone(currentCans);
  }
}

// Update timer display
function updateTimer() {
  document.getElementById('timer').textContent = timer;
}

// Spawns a new item (jerry can or obstacle) in a random grid cell
function spawnItem() {
  if (!gameActive) return;
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach(cell => (cell.innerHTML = ''));

  // Decide what to spawn: 70% can, 30% obstacle
  const isCan = Math.random() < 0.7;
  const randomCell = cells[Math.floor(Math.random() * cells.length)];

  if (isCan) {
    randomCell.innerHTML = `
      <button class="water-can-wrapper" aria-label="Tap the jerry can!">
        <div class="water-can"></div>
      </button>
    `;
    randomCell.querySelector('.water-can-wrapper').onclick = (e) => {
      if (!gameActive) return;
      e.stopPropagation();
      currentCans++;
      updateScore();
      showFeedback('Great catch!', 'success');
      randomCell.innerHTML = '';
      if (currentCans >= GOAL_CANS) endGame(true);
    };
  } else {
    // Pick a random obstacle type
    const obstacle = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    randomCell.innerHTML = `
      <button class="obstacle ${obstacle.class}" aria-label="Avoid! ${obstacle.label}">
        <div></div>
      </button>
    `;
    randomCell.querySelector('.obstacle').onclick = (e) => {
      if (!gameActive) return;
      e.stopPropagation();
      currentCans = Math.max(0, currentCans - 1);
      updateScore();
      showFeedback('Oops! That was a decoy!', 'fail');
      randomCell.innerHTML = '';
    };
  }
}

// Initializes and starts a new game
function startGame() {
  if (gameActive) return;
  gameActive = true;
  currentCans = 0;
  timer = timeLimit;
  updateScore();
  updateTimer();
  createGrid();
  document.getElementById('achievements').textContent = '';
  document.getElementById('achievements').style.display = 'none';
  document.getElementById('feedback-message').textContent = '';
  spawnItem();
  spawnInterval = setInterval(spawnItem, 700); // Faster pace
  timerInterval = setInterval(() => {
    timer--;
    updateTimer();
    if (timer <= 0) endGame(false);
  }, 1000);
}

// End the game, show result
function endGame(won) {
  gameActive = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  // Clear grid
  document.querySelectorAll('.grid-cell').forEach(cell => (cell.innerHTML = ''));
  if (won) {
    showFeedback('You did it! All cans collected!', 'success');
    document.getElementById('achievements').textContent = '🏆 You win! 🏆';
    document.getElementById('achievements').style.display = 'block';
  } else {
    showFeedback('Time\'s up! Try again!', 'fail');
    document.getElementById('achievements').textContent = '';
    document.getElementById('achievements').style.display = 'none';
  }
}

// Example grid generation function with interactive elements
function generateGrid(decoyCount) {
  const grid = document.querySelector('.game-grid');
  grid.innerHTML = '';
  const totalCells = 9;
  let canIndices = [];
  let decoyIndices = [];

  // Randomly select indices for cans and decoys
  while (canIndices.length < 3) {
    let idx = Math.floor(Math.random() * totalCells);
    if (!canIndices.includes(idx)) canIndices.push(idx);
  }
  while (decoyIndices.length < decoyCount) {
    let idx = Math.floor(Math.random() * totalCells);
    if (!canIndices.includes(idx) && !decoyIndices.includes(idx)) decoyIndices.push(idx);
  }

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';

    if (canIndices.includes(i)) {
      // Add water can
      const can = document.createElement('button');
      can.className = 'water-can-wrapper';
      can.innerHTML = '<div class="water-can"></div>';
      can.addEventListener('click', function (e) {
        e.stopPropagation();
        // Remove can from DOM
        can.remove();
        // Update score, feedback, etc.
        currentCans++;
        updateScore();
        showFeedback('Great catch!', 'success');
        if (currentCans >= GOAL_CANS) endGame(true);
      });
      cell.appendChild(can);
    } else if (decoyIndices.includes(i)) {
      // Add obstacle/decoy
      const obstacle = document.createElement('button');
      obstacle.className = 'obstacle decoy-bottle';
      obstacle.innerHTML = '<div></div>';
      obstacle.addEventListener('click', function (e) {
        e.stopPropagation();
        // Remove obstacle from DOM
        obstacle.remove();
        // Show feedback, penalty, etc.
        currentCans = Math.max(0, currentCans - 1);
        updateScore();
        showFeedback('Oops! That was a decoy!', 'fail');
      });
      cell.appendChild(obstacle);
    }
    grid.appendChild(cell);
  }
}

// Listen for difficulty changes
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    winCondition = DIFFICULTY_SETTINGS[currentDifficulty].winCondition;
    timeLimit = DIFFICULTY_SETTINGS[currentDifficulty].timeLimit;
    decoyCount = DIFFICULTY_SETTINGS[currentDifficulty].decoyCount;
    // Reset UI to reflect new settings if needed
    document.getElementById('timer').textContent = timeLimit;
    document.getElementById('current-cans').textContent = 0;
    // ...reset other UI as needed...
  });
});

// Set up click handler for the start button
document.getElementById('start-game').addEventListener('click', startGame);
