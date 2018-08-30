window.onload = init;  // запускает init после полной загрузки страницы.

// 	функция которая запускается при загрузки страницы и запускает функцию при нажатии кнопки.
function init() {
	var fireButton = document.getElementById("fireButton");		
	fireButton.onclick = handleFireButton;					// назначаем функцию-обрабодчик при нажатии кнопки, вызыам функцию hadleFireButton
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;					// запускает обрабодчик для обработки событий при нажатия клавиш в поле вода init
	
	model.generateShipLocation();
}


// данная функция будет вызываться при каждом нажатия кнопки. дополнительно получает значение от guessInput
function handleFireButton() {           
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;                             // извлекаем значение введенное пользователем и присваеваем переменной guess 
	controller.processGuess(guess);	
	
	guessInput.value = "";        // для очистки что бы не удалять прошлое значение в ручную. 
	
}


// обрабодчик события при нажатия клавиши. (e) передает объект события обработчику. Объект передает информацию какая клавиша была нажата.
function handleKeyPress(e) { 
	var fireButton = document.getElementById("fireButton");
	if (e.keyCode == 13){								// свойство keyCode сравнивается со значением 13. так как код Enter = 13
		fireButton.click(); 							// метод click иметирует нажатие на кнопку "ОГОНЬ!"
		return false;									// останавливает и не отправляет данные.
	}
}








//вспомогательная функция проверки введенных данных и приобразование в число 

function parseGuess(guess){
			
		var massVert = ["A", "B", "C", "D", "E", "F", "G"];
		
		if (guess === null || guess.length !== 2) {       // проверка на количество вводимых символов
			alert ("Тип данных не поддерживаются!");
		} 
		else {
			//преобразуем первый символ в цифру. Путем индексации через массив massVert
			var firstChar = guess.charAt(0);              
			var row = massVert.indexOf(firstChar);               // 
			// второй символ
			var secondChar = guess.charAt(1);           
			
			// проверка на число
			if (isNaN(row)|| isNaN(secondChar)) {					
				alert("Ввуденные данный не соответствуют условиям!");
			}
			
			//проверка на условие 
			else if (row < 0 || row >= model.boardSize || secondChar < 0 || secondChar >= model.boardSize){
				alert("Обратите внимание! Ваши координаты не соответствуют координам поля!");
			}
			
			else {
				return row + secondChar; 
			}
		}
		return null;             // если какая проверка из вышеперечисленных не прошла, возвращаем null
}




//представление. То что отображается на экране!

var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("massageArea");
		messageArea.innerHTML = msg;
	},
	
	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");                  //добовляем к td атрибут class со значением hit
	},
	
	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");					//добовляем к td атрибут class со значением miss
	}
};


//модель то что происходит внутри игры!

var model = {
	boardSize: 7,   // размер сетки игрового поля 
	numShip: 3,  	// количество кораблей в игре
	shipsSunk: 0,	// количество потопленных кораблей
	shipLength: 3,	// длина каждого корабля 
	ships: [														// позиция короблей и координаты попадания
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }	
	],
	
	fire: function(guess) {                                 // метод вводит координаты от игрока 
		for (var i = 0; i < this.numShip; i++) {				// перебераем каждый корабль
			var ship = this.ships[i];						// тут ссылка на один из объектов коробля 
			var index  = ship.locations.indexOf(guess);		// свойсва массив location объекта корабля. 
			if (index >= 0) {
				ship.hits[index] = "hit";
				view.displayHit(guess);				
				view.displayMessage("Попал!"); 
				
				if (this.isSunk(ship)) {                 // Проверка на потоплен ли корабль полность. вызываем метод isSunk. если условие true то корабль полностью потоплен.
					view.displayMessage("Кораболь потоплен!");
					++this.shipsSunk;					// увеличиваем счетчик "количество потопленных кораблей"	
				}

				return true;
			}
		}	
		
		view.displayMiss(guess);
		view.displayMessage("Промах. Готовь новый залп!");		
		return false;
	},
	
	isSunk: function(ship) {								// метод проверяет помечены ли все клетки коробля или нет. параметр принимает аргумент из метода fire
		for (var i = 0; i < this.shipLength; i++) {		
			if (ship.hits[i] !== "hit") {					//  ship имеет ссылку на свойства массив объекта
				return false; 							
			}
		}
		return true;
	},
	
	generateShipLocation: function() {          // метод заполняет массив ships пока не будет достаточным количеством кораблей. 
		var location;
		for (var i = 0; i < this.numShip; i++) {    
			do {
				locations = this.generateShip();   	// метод генерирует набор позиций
			} while(this.collision(locations));		//проверка наслоения и перекрытия позиций короблей
			this.ships[i].locations = locations;
		}
									
	},
	
	generateShip: function() {						//метод для создания случайного расположения кораблей по горизонтали или по вертикали
		var direction = Math.floor(Math.random() * 2);      // определяем направление кораблей (вертикаль или горизонталь)
		var row, col;

		if (direction === 1){ 						//1 по горизонтали
				row = Math.floor(Math.random() * this.boardSize);           //размещаем первую клетку корабля по строке 
				col = Math.floor(Math.random() * (this.boardSize - this.shipLength));		// размещение первой клетки корабля по столбцу 
		}
		else {										// 0 по вертикали 
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}
		
		var newShipLocations = [];							// пустой массив куда будут вноситься месторасположения корабля.
		for (var i = 0; i < this.shipLength; i++) {  	 	// размещаем по клеткам корабль с помощью цикла. 
			if (direction === 1) {							//горизонтально 
				newShipLocations.push(row + "" + (col + i));		// заполняем массив значением row и col
			}
			else {											//вертикально 
				newShipLocations.push((row + i) + "" + col);
			}
		}
		
		return newShipLocations;
		
		
	},
	
	collision: function(location) {      //метод получает данные корабля и проверяет перекрывает ли хотя бы одна клетка корабля другую клетку корабля.
		for (var i = 0; i < this.numShip; i++) { 	// перебераем корабли
			var ship = model.ships[i];
			for (var j = 0; j < location.length; j++) {
				if (ship.locations.indexOf(location[j]) >= 0) {    // если хоть одно значение схоже то возвращает true и цикл(do while) в generateShipLocation повторяется вновь
					return true;
				}
			}
			
			return false;
		}
			
	}
	
};


// контроллер, отслеживание и обработка(вызовом функции parseGuess) координатов выстрела, проверка заверщение игры. Отслеживанеи количества выстрелов, запрос к модели на обновление  в соответстие с последним выстрелом. 

var controller = {
	guesses: 0, 							//количество выстрелов
	
	processGuess: function(guess) {
		var location = parseGuess(guess);
		if (location) {
			this.guesses++;
			var hit = model.fire(location);         // вызываем метод fire с приобразоваными элементами. Результат присваивам переменной hit.
			if (hit && model.shipsSunk === model.numShip) {
				view.displayMessage("Все коробли потоплены, понадобилось " + this.guesses + " выстрелов. Поздравляю!");
			}
		}
	}
};









