let view = {
  displayMessage: function (message) {
    let messageArea = document.getElementById('messageArea');
    messageArea.innerHTML = message;
  },

  displayHit: function (location) {
    let cell = document.getElementById(location);
    cell.setAttribute('class', 'hit');
  },
  displayMiss: function (location) {
    let cell = document.getElementById(location);
    cell.setAttribute('class', 'miss');
  },
};

let model = {
  boardSize: 7,
  numShips: 3,
  shipsSunk: 0,
  shipLength: 3,
  ships: [
    { locations: ['', '', ''], hits: ['', '', ''] },
    { locations: ['', '', ''], hits: ['', '', ''] },
    { locations: ['', '', ''], hits: ['', '', ''] },
  ],

  fire: function (guess) {
    for (let i = 0; i < this.numShips; i++) {
      let ship = this.ships[i];
      let index = ship.locations.indexOf(guess);

      if (ship.hits[index] === 'hit') {
        view.displayMessage('OOPs, you already hit that location!');
        return true;
      } else if (index >= 0) {
        ship.hits[index] = 'hit';
        view.displayHit(guess);
        view.displayMessage('HIT!');

        if (this.isSunk(ship)) {
          view.displayMessage('You sank my battleship!');
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMiss(guess);
    view.displayMessage('You missed');
    return false;
  },

  isSunk: function (ship) {
    for (let i = 0; i < ship.length; i++) {
      if (ship.hits[i] !== 'hit') {
        return false;
      }
    }
    return true;
  },

  generateShipsLocations: function () {
    let locations;

    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (!this.collision(locations));
      this.ships[i].locations = locations;
    }
  },

  generateShip: function () {
    let direction = Math.floor(Math.random() * 2);
    let row, col;
    let newShipLocations = [];

    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }

    for (let i = 0; i < this.shipLength; i++)
      if (direction === 1) {
        newShipLocations.push(`${row}${col + i}`);
      } else {
        newShipLocations.push(`${row + i}${col}`);
      }
    return newShipLocations;
  },

  collision: function (locations) {
    let collisionArray = locations.reduce((prev, cur) => {
      let array = getVerticalLineOfArray(cur).map((item) =>
        getHorizontalLineOfArray(item)
      );

      prev = prev.concat(...array);
      return [...new Set(prev)].filter((item) => item >= 0);
    }, []);

    let currentShipLocations = this.ships.reduce((prev, cur) => {
      prev.push(...cur.locations);
      return prev;
    }, []);

    return collisionArray.every((item) => !currentShipLocations.includes(item));
  },
};

let controller = {
  guesses: 0,

  processGuess: function (guess) {
    let location = parseGuess(guess);
    if (location) {
      this.guesses++;
      let hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage(
          `You sank all my battleships, in ${this.guesses} guesses`
        );
      }
    }
  },
};

function parseGuess(guess) {
  let alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  if (guess === null || guess.length !== 2) {
    alert('Oops, please enter a letter and number on the board.');
  } else {
    let firstChar = guess.charAt(0);
    let row = alphabet.indexOf(firstChar);
    let column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board");
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.size
    ) {
      alert("Oops, that's off the board");
    } else {
      return row + column;
    }
  }

  return null;
}

function init() {
  let fireButton = document.getElementById('fireButton');
  fireButton.onclick = handleButton;
  let guessInput = document.getElementById('guessInput');
  guessInput.onkeydown = handleKeyPress;
  model.generateShipsLocations();
}

function handleButton() {
  let guessInput = document.getElementById('guessInput');
  let guess = guessInput.value.toUpperCase();
  controller.processGuess(guess);
  guessInput.value = '';
}

function handleKeyPress(e) {
  let fireButton = document.getElementById('fireButton');
  e = e || window.event;

  if (e.keyCode === 13) {
    fireButton.click();
    return false;
  }
}

window.onload = init;

function getHorizontalLineOfArray(string) {
  return new Array(3).fill(string).map((item, index) => {
    if (index === 0) {
      item = (+item - 10).toString();
    } else if (index === 2) {
      item = (+item + 10).toString();
    }
    return item;
  });
}

function getVerticalLineOfArray(string) {
  return new Array(3).fill(string).map((item, index) => {
    if (index === 0) {
      item = (+item - 1).toString();
    } else if (index === 2) {
      item = (+item + 1).toString();
    }

    if (item < 10 && index != 1 && item >= 0) {
      item = '0' + item;
    }

    return item;
  });
}
