window.gridbase = 5;
window.calculatedID = function (row, col) {
    return window.gridbase * (row - 1) + col;
};
window.calculatedRow = function (cellIndex) {
    return Math.ceil(cellIndex / gridbase);
};
window.calculatedCol = function (cellIndex) {
    return Math.ceil(cellIndex % gridbase);
};
window.numberOfBombs =10;

$(document).ready(function () {
    //choose the size of the board
    var board = $(document.createElement('table')).appendTo('.gameBoard');

    $('li').click(function () {
        //alert(this.id);
        $(this).addClass('highlight');
        window.gridbase = parseInt(this.innerHTML);
        //alert(this.innerHTML + 1);
        // alert(window.gridbase);
        // numberOfRows = this.innerHTML;

    });

    $('p').click(function () {
        $('.gameOptions').css({
            "display": "none"
        });
        $('.gameBoard').fadeIn(1000);
        var gridBase = window.gridbase; // 3;
        var maxRow = gridBase;
        var minRow = 1;
        var maxCol = gridBase;
        var minCol = 1;
        var numberOfRows = gridBase;
        var numberOfColumns = gridBase;
        boardSize = numberOfRows * numberOfColumns;
        var howManyBombs = window.numberOfBombs;
        a_gameSquares = [];
        a_blankRow = [];
        a_blankCol = [];
        a_blankIndex = [];
        a_blankCelVal = [];

        var gameSquare = function (parentTr, numRow, i, j) {
            this.parentRow = parentTr;
            this.squareID = 'sq_' + window.calculatedID(i, j); //(numRow * (i - 1) + j);//calculateID(i, j); //(numRow * (i - 1) + j);
            this.cellID = window.calculatedID(i, j); //(numRow * (i - 1) + j);
            this.row = i;
            this.col = j;
            this.cellVal = 0;
            this.gridSize = window.gridbase;
            this.isCleared = false;
            this.isBomb = false;
            this.a_touchingSquares = [];
            this.howManyBombsTouching = 0;
            this.touchCounter = 0;
            var gc = $(document.createElement('td')).appendTo(this.parentRow).attr('id', this.squareID);
        };

        //create board
        //alert(a_gameSquares.length);
        //alert('gridbase ' +gridBase+ ' numRow ' +numberOfRows+ ' numColumn ' + numberOfColumns + 'boardSize' + boardSize +'howmanyBombs' +  howManyBombs);
        $('table').show();
        for (m = 1; m < numberOfRows + 1; m++) {
            var gameRow = $(document.createElement('tr')).appendTo('table').attr('id', 'r_' + m);
            // alert('new i = ' + i);       
            for (p = 1; p < numberOfColumns + 1; p++) {
                // alert(i + ' ' + j + ' ' + numRow + ' ' + numColumn);
                var GS = new gameSquare(document.getElementById("r_" + m), numberOfRows, m, p);
                a_gameSquares.push(GS);
                // alert(GS.cellID);
            }
        }
        //alert(a_gameSquares.length);
        //make the array for bombs
        var bombs = [];

        //find random numbers and put them in array
        var makeNumbers = function () {
            //bombs[0] = (Math.floor(Math.random() * boardSize) + 1);
            for (i = 0; i < howManyBombs; i++) {
                var getNumber = (Math.floor(Math.random() * boardSize) + 1);
                //compare the rest of the numbers to each other
                while ($.inArray(getNumber, bombs) !== -1) {
                    getNumber = (Math.floor(Math.random() * boardSize) + 1);
                }
                bombs[i] = getNumber;
            }
        };
        makeNumbers();

        // make function to count how many squares each cell touches and add to array
        function cellTouch(f, g) {
            for (i = 0; i < g.length; i++) {
                //function that puts all squares around it in array
                var thisCell = g[i];
                var thisRow = thisCell.row;
                var thisCol = thisCell.col;
                if ($.inArray(i + 1, bombs) !== -1) {
                    thisCell.cellVal = f;
                    thisCell.isBomb = true;
                }
                for (c = thisCol - 1; c <= thisCol + 1; c++) // loop through columns (this - 1) to (this + 1)
                { //alert(c);
                    for (r = thisRow - 1; r <= thisRow + 1; r++) // loop through rows (this - 1) to (this + 1)
                    {
                        //alert(thisCellID + ' ' + c + ' ' + r);                
                        if (c > 0 && r > 0 && c <= gridBase && r <= gridBase && (c !== thisCol || r !== thisRow)) {
                            thisCell.a_touchingSquares.push(window.calculatedID(r, c));
                        } else {}
                    }
                }
                //alert("Cell # :" + thisCell.cellID + " Touches cells: " + thisCell.a_touchingSquares);
            }
        }

        //loop through each cell, looping through its touchingSquares to take a count
        //alert('you are getting here');
        function countTouch(q, r) {
            for (i = 0; i < r.length; i++) {
                var currentCell = r[i];
                if (currentCell.cellVal === q) { //do nothing
                } else { //alert('touchingSquares length = ' + currentCell.a_touchingSquares.length);
                    //currentCell.a_touchingSquares.sort(function(a, b){return a-b});
                    for (tc = 0; tc < currentCell.a_touchingSquares.length; tc++) {
                        if (r[(currentCell.a_touchingSquares[tc]) - 1].cellVal === q) {
                            currentCell.howManyBombsTouching = currentCell.howManyBombsTouching + 1;
                        }
                    }
                    currentCell.cellVal = currentCell.howManyBombsTouching;
                }
            }
        }


        // alert(bombs.length);
        //print array in console log to check
        //console.log(bombs);
        
        //assign numbers to squares to be bombs
        cellTouch(9, a_gameSquares);
        countTouch(9, a_gameSquares);
        
      //  for (j = 1; j < (boardSize + 1); j++) {
       //     if ($.inArray(j, bombs) !== -1) {
                //cellTouch(9, a_gameSquares);
                //countTouch(9, a_gameSquares);
       //     }
       // }

        function cellClasses(cellToFormat) {
                var thisSquare = $(document.getElementById(cellToFormat.squareID));
                cellToFormat.isCleared = true;
                cellToFormat.a_touchingSquares.sort(function(a, b){return a-b;});
                if (cellToFormat.cellVal === 0) 
                {
                    while (cellToFormat.touchCounter < cellToFormat.a_touchingSquares.length)
                    {
                        if(a_gameSquares[cellToFormat.a_touchingSquares[cellToFormat.touchCounter]-1].isCleared)
                            { //do nothing
                            }
                      	else
                            {		
                                cellClasses(a_gameSquares[cellToFormat.a_touchingSquares[cellToFormat.touchCounter]-1]);
                            }
                        cellToFormat.touchCounter++;
                    }
                    cellToFormat.isCleared = true;
                    thisSquare.addClass('notBomb');
                }
                else if (cellToFormat.cellVal === 1) {
                    thisSquare.addClass('one');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 2) {
                    thisSquare.addClass('two');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 3) {
                    thisSquare.addClass('three');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 4) {
                    thisSquare.addClass('four');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 5) {
                    thisSquare.addClass('five');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 6) {
                    thisSquare.addClass('six');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 7) {
                    thisSquare.addClass('seven');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 8) {
                    thisSquare.addClass('eight');
                    cellToFormat.isCleared = true;
                } else if (cellToFormat.cellVal === 9) {
                    thisSquare.addClass('bomb');
                    cellToFormat.isCleared = true;
                }
            //}
        }
        
        //function to handle finding which cells are blank and adding to array
        function findBlanks(blankIndex, blankCellVal) {
            if (blankCellVal === 0 && blankIndex > 0 && blankIndex > (gridbase * gridbase)) {
                alert("blankIndex is " + blankIndex);
                if ($.inArray(blankIndex, a_blankIndex) === -1) {
                    a_blankIndex.push(blankIndex);
                    a_blankIndex.sort();
                } else {}

            } else {}
        }

        function clearTheRest() {
            for (i = 0; i <= a_blankIndex.length; i++) {
                var arrayItem = a_blankIndex[0];
                //alert("array item is " + arrayItem);
                var clearRow = window.calculatedRow(arrayItem);
                //alert("clearRow is " + clearRow);
                var clearCol = window.calculatedCol(arrayItem);
                //alert("clearCol is " + clearCol);
                //clearTouch(clearRow, clearCol);
            }
        }

        function emptyArray() {
            a_blankIndex.length = 0;
        }
       // clearTheRest();
        emptyArray();

        //make function to go through array to count bombs and assign cellVal
        //format cells when clicked based on cellVal
        function assign() {
            var thisCol = $(this).index() + 1;
            var thisRow = ($(this).closest('tr').index() + 1);
            var thisIndex = window.calculatedID(thisRow, thisCol);
            var thisCell = a_gameSquares[thisIndex - 1];
            //var thisCellVal = a_gameSquares[thisIndex - 1].cellVal;
          // alert(thisCell.isCleared);
            cellClasses(thisCell);
        }
        $('td').on('click', assign);
    });
});
