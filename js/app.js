$(function(){
	var model = {
		sizes:[5,6,7,8,9,10],
		levelOptions: [ 
				{id:1,level:"Easy Peasy",pct:0.2},
				{id:2,level:"Medium",pct:0.33},
				{id:3,level:"Hard",pct:0.45},
				{id:4,level:"Foolhardy",pct:0.6}		
			],
		gridbase:4,
		numBombs:null,
		numBombsLeft:null,
		minRow:null,
		minCol:null,
		maxRow:null,
		maxCol:null,
		gameSquares:[],
		bombSquares:[],
		bombIDs:[],
		emptySquares:[],
		currentLevel:null,
		gameStatus:null,
		init: function(){
			//this.gridbase =  4;
			//this.numBombs = 10;
			this.minRow = 1;
			this.minCol = 1;
			this.maxRow = null;
			this.maxCol = null;
			this.gameSquares = [];
			this.bombSquares = [];
			this.bombIDs = [];
			this.emptySquares = [];
			//this.currentLevel = null;
		},
		gameSquare: function(address){
			this.row=controller.calculateRow(address);
			this.col=controller.calculateCol(address);
			this.id=address;
			this.cellVal=0;
			this.isCleared=false;
			this.isBomb=false;
			this.isFlagged=false;
			this.a_touchingSquares=[];
			this.howManyBombsTouching=0;
			this.touchCounter=0;
			this.cell=$('#'+address+'.cell');
		}
	};



	var view = {
		init: function(){
			view.renderTop();
		},
		updateSlider: function(){
			$('#size').html(model.gridbase + "x" + model.gridbase);
			$('#gridsize').change(function(){
				controller.setGridbase(this.value);
				view.updateSlider();
			});

		},
		hideOptions: function(){
			$('#gameOptions').slideUp(1000,function(){
					$('#optionsToggle').slideDown(1000);
				});
			$('#optionsToggle > a').on('click',function(){
				view.showOptions();
			});
			$('#lower').slideUp(1000);
		},
		showOptions: function(){
			$('#optionsToggle').slideUp(500,function(){
					$('#gameOptions').slideDown(1000);
					$('#lower').slideUp(1000);
					$('#scoreboard').hide();
					$('#lower').hide();
				});
		},
		renderTop: function(){
			$('#difficulty').empty();
			var str = '';
			model.levelOptions.forEach(function(option){
				str+='<li class="level" id="'+option.id+'" >'+option.level+'</li>'
			});
			$('#difficulty').html(str);
			$('.level').on('click',function(){
				controller.setLevel($(this).attr("id"));
				$(this).parent().children().removeClass("selectedLevel");
				$(this).toggleClass("selectedLevel");
				$('#gameStart>a').slideDown(600);
			});
			
			$('#gridsize').change(function(){
				controller.setGridbase(this.value);
				view.updateSlider();
			});
			$('#gameStart > a').on('click',function(){
				controller.setupGame();				
			});
			view.updateSlider();
		},
		renderLower: function(){
			$('#lower').slideDown(1000);
			$('#scoreboard').show();
			view.renderStats();
			$('#lower').oncontextmenu = function(){return false;};
		},
		renderStats: function(){
			$('#infogrid >a').html(model.gridbase +'X'+ model.gridbase);
			$('#infolevel >a').html(model.currentLevel.level);
			$('#infobombstotal>a').html( model.numBombs);
			$('#infobombsleft>a').html(model.numBombsLeft);
		},
		toggleFlag: function(id){
			var thisCell = model.gameSquares[id-1];
			//If already cleared, do nothing
			if(thisCell.isCleared)
			{			
			}
			//If already flagged, toggle class and isflagged status
			//This is so that flagged cells that get left clicked don't get
			//cleared
			else if(thisCell.isFlagged)
			{
				thisCell.cell.toggleClass('flag');
				thisCell.isFlagged=false;
				model.numBombsLeft++;
			}
			else if(!thisCell.isFlagged)
			{
				thisCell.cell.toggleClass('flag');
				thisCell.isFlagged=true;
				model.numBombsLeft--;
			}
			view.renderStats();
		}
	};

	var controller = {
		init:function(){
			this.board = $('#gameBoard');
			this.board.empty();
		},
		setupGame: function(){
			model.init();
			view.hideOptions();
			controller.init();
			controller.buildBoard();
			view.renderLower();
			model.gameStatus='active';
		},
		setLevel: function(id){
			model.currentLevel = model.levelOptions[id-1];
		},
		setGridbase: function(base){
			model.gridbase = base;
		},
		buildBoard: function(){
			model.maxRow=model.gridbase;
			model.maxCol=model.gridbase;
			var numCells=model.gridbase*model.gridbase;
			model.numBombs = Math.floor(numCells*model.currentLevel.pct);
			model.numBombsLeft=model.numBombs;
			controller.generateCells(model.gridbase);
			controller.generateBombs(numCells,model.numBombs);
			controller.countTouches();
			$('#gameBoard .cell').on('click',function(){
				controller.processClick(this.id);
			});
			$('#gameBoard').oncontextmenu=function(){
				return false;
			};
			$('#gameBoard .cell').mousedown(function(e){
				if(e.button ==2){
					view.toggleFlag(this.id);
					return false;
				}
			});
		},
		calculateID: function(row,col){
			return model.gridbase * (row - 1) + col;
		},
		calculateRow: function(address){
			return Math.ceil(address/model.gridbase);
		},
		calculateCol: function(address){
			if(Math.floor(address%model.gridbase)===0)
			{
				return model.gridbase;
			}
			else{
				return Math.floor(address%model.gridbase);
			}
		},
		generateCells: function(gridbase){
			controller.board.empty();
			controller.resetModel();
			this.row = null;
			//a is the address of the cell being created
			var a = 1;
			for(r=1;r<=gridbase;r++)
			{
				var rowStr = '<tr class="row" id='+r+'></tr>'; 
				controller.board.append(rowStr);
				for(c=1;c<=gridbase;c++)
				{
					this.row = $('#'+r+'.row');
					var address = ((r*gridbase)-gridbase)+c;
					var cellStr = '<td class="cell" id='+address+'></td>';
					this.row.append(cellStr);
					var GS = new model.gameSquare(address);
					model.gameSquares.push(GS);
				}
				//alert(model.gameSquares.length);
			}
		},
		generateBombs: function(gridsize,numBombs){
			for(i=0;i<numBombs;i++)
			{
				var num = Math.floor(Math.random()*gridsize)+1;
				while($.inArray(num,model.bombIDs)!==-1){
					num = Math.floor(Math.random()*gridsize)+1;
				}
				model.bombIDs[i] = num;
			}
			model.bombIDs.sort();
			for(b=0;b<model.bombIDs.length;b++)
			{
				//alert(model.bombIDs[b]);
				model.gameSquares[model.bombIDs[b]-1].isBomb=true;
				model.gameSquares[model.bombIDs[b]-1].cellVal=9;
				//model.gameSquares[model.bombIDs[b]-1].cell.html("bomb");
			}
		},
		countTouches: function(){
			for(c = 0;c<model.gameSquares.length;c++)
			{
				var curRow = model.gameSquares[c].row;
				var curCol = model.gameSquares[c].col;
				var curCell = model.gameSquares[c];

				for(i = curRow -1;i<=curRow+1;i++)
				{
					if(i>0 && i<=model.gridbase)
					{
						for(j = curCol-1;j<=curCol+1;j++)
						{
							if(j>0 && j<=model.gridbase && (i!== curRow||j!==curCol))
							{
								curCell.a_touchingSquares.push(controller.calculateID(i,j));
								if(model.gameSquares[controller.calculateID(i,j)-1].isBomb===true)
								{
									curCell.howManyBombsTouching++;
								}
							}
						}
					}
				}
				if(curCell.isBomb===false){
					curCell.cellVal=curCell.howManyBombsTouching;
				}
				//curCell.cell.html(curCell.cellVal); //Just as a reference
			}
		},
		countBombTouches: function(){

		},
		processClick: function(id){
			var thisCell = model.gameSquares[id-1];
			//If this cell is flagged, do not process a left click
			if (thisCell.isFlagged)
			{
				return false;
			}

			thisCell.isCleared=true;
			if(thisCell.cellVal===0)
			{
				while(thisCell.touchCounter<thisCell.a_touchingSquares.length)
				{
					if(model.gameSquares[thisCell.a_touchingSquares[thisCell.touchCounter]-1].isCleared===true)
					{
						//do nothing
					}
					else
					{
						controller.processClick(model.gameSquares[thisCell.a_touchingSquares[thisCell.touchCounter]-1].id);
					}
					thisCell.touchCounter++;
				}
				thisCell.isCleared = true;
				thisCell.cell.addClass('notBomb');
			}
			else if (thisCell.cellVal === 1) {
                    thisCell.cell.addClass('one');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 2) {
                    thisCell.cell.addClass('two');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 3) {
                    thisCell.cell.addClass('three');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 4) {
                    thisCell.cell.addClass('four');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 5) {
                    thisCell.cell.addClass('five');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 6) {
                    thisCell.cell.addClass('six');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 7) {
                    thisCell.cell.addClass('seven');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 8) {
                    thisCell.cell.addClass('eight');
                    thisCell.isCleared = true;
                } else if (thisCell.cellVal === 9) {
                    thisCell.cell.addClass('bomb');
                    thisCell.isCleared = true;
                }

		},
		resetModel: function(){
			model.init();
			//view.init();
		},
		checkGameStatus: function(){
			if(numBombsLeft <1)
			{
				model.gameStatus='done';
			}
			else{
				model.gameStatus='active';
			}
		}

	};
	model.init();
	controller.init();
	view.init();
});