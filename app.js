const view = {
  displayMessage: function (msg) {
    const messageArea = document.getElementById("messageArea");
    messageArea.textContent = msg;
  },

  displayHit: function (location) {
    const cell = document.getElementById(location);
    cell.classList.add("hit");
  },

  displayMiss: function (location) {
    const cell = document.getElementById(location);
    cell.classList.add("miss");
  },
};

const model = {
  boardSize: 7, //Размер игрового поля
  numShips: 3, //Количество кораблей в игре
  shipLength: 3, //Длина корабля в клетках
  shipsSunk: 0, //Текущее количество кораблей, потопленных игрком
  ships: [
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
  ],

  fire: function(guess) {
    // Перебираем массив кораблей и для каждого корабля сверяем координаты пользователя со значением
    // массива locations. Если есть попадание, то выстрел попал в цель и мы ставим соответствующую отметку
    // в массиве hits
    for (let i = 0; i < this.numShips; i++) {
      const ship = this.ships[i];
      const index = ship.locations.indexOf(guess);
      if (index >= 0) {
        ship.hits[index] = 'hit';
        // Оповещаем представление (view) о том, что в клетке guess следует вывести маркер попадания
        view.displayHit(guess);
        // Приказываем представлению вывыести на экран сообщение о попадании
        view.displayMessage('HIT!');
        // Проверка на то, был ли потоплен корабль при попадании. Если да, то увеличиваем счетчик потопленных кораблей
        // в свойстве shipSunk модели и сообщаем игроку о том, что он потопил корабль
        if (this.isSunk(ship)) {
          view.displayMessage('You sank my battleship!');
          this.shipsSunk++;
        }
        return true;
      }
    }
    // Если попадание не обнаружено, возвращаем false и выводим маркер промаха, а также сообщение пользователю о том
    // что он промахнулся
    view.displayMiss(guess);
    view.displayMessage('You missed.');
    return false;
  },

  //Метод принимает объект ship и проверяет, помечены ли все его клетки маркером попадания
  isSunk: function(ship) {
    for (let i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== 'hit') {
        return false; //Если есть хотя бы одна клетка, в которую не попали, то корабль еще жив и возвращается false
      }
    }

    return true; // А если нет и все маркеры присутствуют, то корабль считается потопленным и возвращается true
  },

  generateShipLocation: function() {
    let locations;

    // В цикле для каждого корабля генерируется набор позиций, т.е. занимаемых клеток
    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip(); // Генерируем новый набор позиций
      } while(this.collision(locations)) {   // Проверяем, перекрываются ли эти позиции с существующими кораблями
        this.ships[i].locations = locations; // на доске. Если есть перекрытия, нужна еще одна попытка
      }
    }
  },

  generateShip: function() {
    const direction = Math.floor(Math.random() * 2);
    let row, col;

    // Если direction равно 1, содается горизонтальный корабль. Для значения 0 создается вертикальный 
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
      col = Math.floor(Math.random() * this.boardSize);
    }

    const newShipsLocations = [];
    for (let i = 0; i < this.shipLength; i++) {
      // Если direction равно 1, содается горизонтальный корабль. Для значения 0 создается вертикальный 
      if (direction === 1) {
        newShipsLocations.push(row + '' + (col + i));
      } else {
        newShipsLocations.push((row + i) + '' + col);
      }
    }

    return newShipsLocations;
  },

  collision: function(locations) {
    // Для каждого корабля, уже находящегося на поле, проверить, встречается ли какая-либо из позиций
    // массива locations нового корабля в массиве locations существующих кораблей.
    for (let i = 0; i < this.numShips; i++) {
      const ship = model.ships[i];
      for (let j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }

    return false;
  }
};

const controller = {
  // Количество выстрелов
  guessess: 0,

  // Обработка координат выстрела и передача их модели. Проверяет условия завершения игры
  processGuess: function(guess) {
    const location = parseGuess(guess); //Если метод не возвращает Null, значит был получен действительный объект loc

    if (location) {
      this.guessess++;
      const hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage(`You sank all my battleships, in ${this.guessess} guesses`);
      }
    }
  }
}

function parseGuess(guess) {
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  if (guess === null || guess.length !== 2) {
    alert('Oops, please enter a letter and a number on the board.');
  } else {
    const firstChar = guess.charAt(0);
    const row = alphabet.indexOf(firstChar);
    const column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else if (row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) {
      alert("Oops, that's off the board.");
    } else {
      return row + column;
    }
  }

  // Если управление перешло в эту точку, значит какая-то из проверок не прошла и возвращется Null;
  return null;
}

function init() {
  const fireButton = document.getElementById('fireButton');
  fireButton.onclick = handleFireButton;
  const guessInput = document.getElementById('guessInput');
  guessInput.onkeypress = handleKeyPress;

  model.generateShipLocation();
}

function handleFireButton() {
  const guessInput = document.getElementById('guessInput');
  const guess = guessInput.value;
  controller.processGuess(guess);

  guessInput.value = '';
}

function handleKeyPress(event) {
  const fireButton = document.getElementById('fireButton');
  if (event.keyCode === 13) {
    fireButton.click();
    return false;
  } 
}

window.onload = init;