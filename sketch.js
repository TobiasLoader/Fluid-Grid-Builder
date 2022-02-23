
var cell = 20;
var gridw = 20;
var gridh = 20;
var gridSkeleton;
var grid;
var gridStatus;
var gridBuildStart;
var gridSpecial = [{x:9,y:0},{x:10,y:0}];
var gridDrawPause = false;
var gridRemoveCell = false;
var fluidStatus;
var fluid;
var emptycells;
var scene = 1;
var floortime = 0;
var timestep = 0.01; // seconds
var supplyStatus = true;
var emptyQuantity = 0.8;
var directionInAccount = false;

var fluidflowdirections = {up:1,left:1,down:1,right:1};//{up:0.1,left:0.5,down:1,right:0.5};

function setup() {
	textAlign(CENTER,CENTER);
	textFont("Avenir Next");
	imageMode(CENTER,CENTER);
	W = window.innerWidth;
	H = window.innerHeight;
	canvas = createCanvas(W, H);
	background(20);
	buildGridSkeleton();
	
}

function buildGridSkeleton(){
	grid = createGraphics(gridw*cell+1,gridh*cell+1);
	gridSkeleton = createGraphics(gridw*cell+1,gridh*cell+1);
	gridStatus = [];
	fluidStatus = [];
	gridSkeleton.stroke(100,100,100,80);
	gridSkeleton.strokeWeight(1);
	for (var x=0; x<=gridw; x+=1){
		gridSkeleton.line(x*cell,0,x*cell,gridh*cell);
	}
	for (var y=0; y<=gridh; y+=1){
		gridSkeleton.line(0,y*cell,gridw*cell,y*cell);
	}
	for (var y=0; y<gridh; y+=1){
		gridStatus.push([]);
		fluidStatus.push([]);
		for (var x=0; x<gridw; x+=1){
			gridStatus[y].push(0);
			fluidStatus[y].push(0);
		}
	}
	gridBuildStart=false;
	for (var i=0; i<gridSpecial.length; i+=1){
		gridStatus[gridSpecial[i].y][gridSpecial[i].x] = 2;
		drawCell(gridSpecial[i].x,gridSpecial[i].y,color(156, 90, 90));
		fluidStatus[gridSpecial[i].y][gridSpecial[i].x] = 1;
	}
}

function mouseHoverCell(){
	let X = floor((mouseX-W/2+cell*gridw/2)/cell)
	let Y = floor((mouseY-H/2+cell*gridh/2)/cell)
	if (0<=X && X<gridw && 0<=Y && Y<gridh){
		return {x:X,y:Y}
	} else {
		return null;
	}
}

function drawGrid(){image(gridSkeleton,W/2,H/2);image(grid,W/2,H/2);}

function drawCell(X,Y,col){
	grid.noStroke();
	grid.fill(col);
	grid.rect(cell*X,cell*Y,cell,cell);
}

function buildGridProcess(){
	var currentMouseHover = mouseHoverCell();
	if (currentMouseHover!=null){
		if (gridBuildStart==false){
			if (gridStatus[currentMouseHover.y][currentMouseHover.x] == 2){
				gridBuildStart=true;
				for (var i=0; i<gridSpecial.length; i+=1){
					drawCell(gridSpecial[i].x,gridSpecial[i].y, color(100, 125, 95));
				}
			}
		}else {
			if (!gridRemoveCell){
				if (gridDrawPause==false && gridStatus[currentMouseHover.y][currentMouseHover.x]==0){
					gridStatus[currentMouseHover.y][currentMouseHover.x] = 1;
					drawCell(currentMouseHover.x,currentMouseHover.y,color(40));
				}
			} else {
				if (gridStatus[currentMouseHover.y][currentMouseHover.x]==1){
					gridStatus[currentMouseHover.y][currentMouseHover.x] = 0;
					grid.clear();
					for (var y=0; y<gridh; y+=1){
						for (var x=0; x<gridw; x+=1){
							if (gridStatus[y][x]==1){drawCell(x,y,color(40));}
							if (gridStatus[y][x]==2){drawCell(x,y,color(100, 125, 95));}
						}
					}
				}
			}
		}
	}
}

function textVisuals(){
	rectMode(CENTER);
	noStroke();
	textSize(20);
	fill(170,170,170,200);
	text("BUILD GRID",W/2,1*H/4-cell*gridh/4);
	text("next  →",3*W/4+cell*gridw/4,H/2);
	stroke(170,170,170,100);
	line(W/2-50,1*H/4-cell*gridh/4+20,W/2+50,1*H/4-cell*gridh/4+20);
	if (mouseInBox(3*W/4+cell*gridw/4-40, H/2-20, 3*W/4+cell*gridw/4+40, H/2+20)){
		line(3*W/4+cell*gridw/4-40,H/2+20,3*W/4+cell*gridw/4+40,H/2+20);
	}
	textSize(14);
	if (gridDrawPause==false){
		fill(170);
		text("PAUSE",W/2-cell*gridw/4,3*H/4+cell*gridh/4);
	} else {
		stroke(170,170,170,100);
		noFill();
		rect(W/2-cell*gridw/4,3*H/4+cell*gridh/4-2,80,30,2)
		noStroke();
		fill(170);
		text("PAUSE",W/2-cell*gridw/4,3*H/4+cell*gridh/4);
	}
	if (gridRemoveCell==false){
		fill(170);
		text("DELETE",W/2+cell*gridw/4,3*H/4+cell*gridh/4);
	} else {
		stroke(170,170,170,100);
		noFill();
		rect(W/2+cell*gridw/4,3*H/4+cell*gridh/4-2,90,30,2)
		noStroke();
		fill(170);
		text("DELETE",W/2+cell*gridw/4,3*H/4+cell*gridh/4);
	}
	rectMode(CORNER);
}

function buildGridScene(){
	background(20,20,20);
	buildGridProcess();
	drawGrid();
	textVisuals();
}

function fluidsum(){
	var ws = 0;
	for (var i=0; i<emptycells.length; i+=1){
		var x = emptycells[i].x;
		var y = emptycells[i].y;
		ws += fluidStatus[y][x];
	}
	textSize(15);
	noStroke();
	fill(150);
	if (supplyStatus){
		text("Fluid Supply: ON",(W-cell*gridw)/4,H/2-cell*gridh/16);
	} else {
		text("Fluid Supply: OFF",(W-cell*gridw)/4,H/2-cell*gridh/16);
	}
	text("Total Quantity: "+round(ws),(W-cell*gridw)/4,H/2+cell*gridh/16);
}

function computeWaterIteration(){
// 	var fluidStatus2 = fluidStatus;
	var difffluid = [];
	for (var y=0; y<gridh; y+=1){
		difffluid.push([]);
		for (var x=0; x<gridw; x+=1){
			difffluid[y].push(0)
		}				
	}
	for (var i=0; i<emptycells.length; i+=1){
		var x = emptycells[i].x;
		var y = emptycells[i].y;
		var flow = 0;
		var directions = 0;
		if (directionInAccount){
			if (x>0 && gridStatus[y][x-1]!=0/*  && fluidStatus[y][x-1]<1 */){
				directions += fluidflowdirections.left;
			}
			if (x<gridw-1 && gridStatus[y][x+1]!=0/*  && fluidStatus[y][x+1]<1 */){
				directions += fluidflowdirections.right;
			}
			if (y>0 && gridStatus[y-1][x]!=0 /* && fluidStatus[y-1][x]<1 */){
				directions += fluidflowdirections.up;
			}
			if (y<gridh-1 && gridStatus[y+1][x]!=0 /* && fluidStatus[y+1][x]<1 */){
				directions += fluidflowdirections.down;
			}
		} else {
			directions = fluidflowdirections.left+fluidflowdirections.right+fluidflowdirections.up+fluidflowdirections.down;
		}
		if (directions>0){
			if (x>0 && gridStatus[y][x-1]!=0 /* && fluidStatus[y][x-1]<1 */){
				flow = (1-fluidStatus[y][x-1])*fluidflowdirections.left*emptyQuantity*fluidStatus[y][x]/directions;
				difffluid[y][x-1] += flow;
				difffluid[y][x] -= flow;
// 				if (fluidStatus2[y][x-1]>1){fluidStatus2[y][x] += fluidStatus2[y][x-1]-1;fluidStatus2[y][x-1]=1;}
			}
			if (x<gridw-1 && gridStatus[y][x+1]!=0 /* && fluidStatus[y][x+1]<1 */){
				flow = (1-fluidStatus[y][x+1])*fluidflowdirections.right*emptyQuantity*fluidStatus[y][x]/directions;
				difffluid[y][x+1] += flow;
				difffluid[y][x] -= flow;
// 				if (fluidStatus2[y][x+1]>1){fluidStatus2[y][x] += fluidStatus2[y][x+1]-1;fluidStatus2[y][x+1]=1;}
			}
			if (y>0 && gridStatus[y-1][x]!=0/*  && fluidStatus[y-1][x]<1 */){
				flow = (1-fluidStatus[y-1][x])*fluidflowdirections.up*emptyQuantity*fluidStatus[y][x]/directions;
				difffluid[y-1][x] += flow;
				difffluid[y][x] -= flow;
// 				if (fluidStatus2[y-1][x]>1){fluidStatus2[y][x] += fluidStatus2[y-1][x]-1;fluidStatus2[y-1][x]=1;}
			}
			if (y<gridh-1 && gridStatus[y+1][x]!=0 /* && fluidStatus[y+1][x]<1 */){
				flow = (1-fluidStatus[y+1][x])*fluidflowdirections.down*emptyQuantity*fluidStatus[y][x]/directions;
				difffluid[y+1][x] += flow;
				difffluid[y][x] -= flow;
// 				print(1-gridStatus[y+1][x], flow)
// 				if (fluidStatus2[y+1][x]>1){fluidStatus2[y][x] += fluidStatus2[y+1][x]-1;fluidStatus2[y+1][x]=1;}
			}
// 			fluidStatus2[y][x] -= 3*fluidStatus2[y][x]/4;
		}
	}
	for (var i=0; i<emptycells.length; i+=1){
		var x = emptycells[i].x;
		var y = emptycells[i].y;
		fluidStatus[y][x] += difffluid[y][x];
/*
		if (fluidStatus[y][x]>1){
			fluidStatus[y][x]=1;
		}
*/
/* 		else  *//*
if (fluidStatus[y][x]<0){
			fluidStatus[y][x]=0;
		}
*/
	}
	if (supplyStatus){
		for (var i=0; i<gridSpecial.length; i+=1){
			fluidStatus[gridSpecial[i].y][gridSpecial[i].x] = 1;
		}
	}
// 	print(fluidStatus[1][9])
}

function drawWaterSimulation(){
	noStroke();
	textSize(10);
	for (var i=0; i<emptycells.length; i+=1){
		var x = emptycells[i].x;
		var y = emptycells[i].y;
		fill(62, 113, 140,255*fluidStatus[y][x]);
		rect(W/2-cell*gridw/2+cell*x,H/2-cell*gridh/2+cell*y,cell,cell);
		fill(20,20,20,100);
		text(round(fluidStatus[y][x]*10)/10,W/2-cell*gridw/2+cell*x+cell/2,H/2-cell*gridh/2+cell*y+cell/2);
	}
}

function similation(){
	if (floor(millis()/(timestep*1000))>floortime){
		background(20,20,20);
		drawGrid();
		computeWaterIteration();
		drawWaterSimulation();
		fluidsum();
	}
	floortime = floor(millis()/(timestep*1000));
}

function draw() {
	if (scene==1){
		buildGridScene();
	}
	else if (scene==2){
		similation();
	}
}

function mouseInBox(x1,y1,x2,y2){
	return mouseX>x1 && mouseX<x2 && mouseY > y1 && mouseY < y2
}

function keyPressed(){
	if (keyCode == 32){gridDrawPause = true;}
	if (keyCode == 8){gridRemoveCell = true;}
	if (keyCode == 13){supplyStatus = false;}
}
function keyReleased(){
	if (keyCode == 32){gridDrawPause = false;}
	if (keyCode == 8){gridRemoveCell = false;}
	if (keyCode == 13){supplyStatus = true;}
}

function mouseClicked(){
	if (scene==1){
		if (mouseInBox(W/2-cell*gridw/4-40,3*H/4+cell*gridh/4-15,W/2-cell*gridw/4+40,3*H/4+cell*gridh/4+15)) {
			gridDrawPause = !gridDrawPause;
		}
		else if (mouseInBox(W/2+cell*gridw/4-40,3*H/4+cell*gridh/4-15,W/2+cell*gridw/4+40,3*H/4+cell*gridh/4+15)) {
			gridRemoveCell = !gridRemoveCell;
		}
		else if (mouseInBox(3*W/4+cell*gridw/4-40,H/2-20,3*W/4+cell*gridw/4+40,H/2+20)){
			for (var i=0; i<gridSpecial.length; i+=1){
				gridStatus[gridSpecial[i].y][gridSpecial[i].x] = 2;
				drawCell(gridSpecial[i].x,gridSpecial[i].y,color(40));
			}
			emptycells = [];
			for (var y=0; y<gridh; y+=1){
				for (var x=0; x<gridw; x+=1){
					if (gridStatus[y][x]!=0){emptycells.push({x:x,y:y})}
				}
			}
			scene = 2;
		}
	} else if (scene==2){
		for (var i=0; i<emptycells.length; i+=1){
			var x = emptycells[i].x;
			var y = emptycells[i].y;
			fluidStatus[y][x] = 0;
		}
		for (var i=0; i<gridSpecial.length; i+=1){
			fluidStatus[gridSpecial[i].y][gridSpecial[i].x] = 1;
		}
	}
}

window.onresize = function() {
	resizeCanvas(windowWidth, windowHeight);
	W = windowWidth;
	H = windowHeight
};
