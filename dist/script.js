/*TODO
	pontozási útmutató
	blokk sebesség
	szintlépés
*/
class Block {
	constructor(name,coords) {
		this.name = name;
		this.coords = coords;
		this.ghostCoords = _.cloneDeep(coords);
		this.dropType = "default";
		this.top = this.coords.reduce((a,b)=>a.y<b.y?a:b).y;
		this.bottom = this.coords.reduce((a,b)=>a.y>b.y?a:b).y;
		this.left = this.coords.reduce((a,b)=>a.x<b.x?a:b).x;
		this.right = this.coords.reduce((a,b)=>a.x>b.x?a:b).x;
		this.ghostTop = this.ghostCoords.reduce((a,b)=>a.y<b.y?a:b).y;
		this.ghostBottom = this.ghostCoords.reduce((a,b)=>a.y>b.y?a:b).y;
		this.ghostLeft = this.ghostCoords.reduce((a,b)=>a.x<b.x?a:b).x;
		this.ghostRight = this.ghostCoords.reduce((a,b)=>a.x>b.x?a:b).x;
		this.height = this.bottom-this.top+1;
		this.width = this.right-this.left+1;
	}

	updateBoundaries() {
		this.top = this.coords.reduce((a,b)=>a.y<b.y?a:b).y;
		this.bottom = this.coords.reduce((a,b)=>a.y>b.y?a:b).y;
		this.left = this.coords.reduce((a,b)=>a.x<b.x?a:b).x;
		this.right = this.coords.reduce((a,b)=>a.x>b.x?a:b).x;
		this.height = this.bottom-this.top+1;
		this.width = this.right-this.left+1;
	}

	updateGhostBoundaries() {
		this.ghostTop = this.ghostCoords.reduce((a,b)=>a.y<b.y?a:b).y;
		this.ghostBottom = this.ghostCoords.reduce((a,b)=>a.y>b.y?a:b).y;
		this.ghostLeft = this.ghostCoords.reduce((a,b)=>a.x<b.x?a:b).x;
		this.ghostRight = this.ghostCoords.reduce((a,b)=>a.x>b.x?a:b).x;
		this.ghostHeight = this.ghostBottom-this.ghostTop+1;
		this.ghostWidth = this.ghostRight-this.ghostLeft+1;
	}

	setDropType(dropType) {
		this.dropType = dropType;
	}

	moveRight() {
		if (this.left+this.width<10) {
			this.coords.forEach((coord,index,arr)=>{
				++arr[index].x;
			})
			this.ghostCoords.forEach((coord,index,arr)=>{
				++arr[index].x;
			})
		}
		this.updateBoundaries();
	}

	moveLeft() {
		if (this.right-this.width>=0) {
			this.coords.forEach((coord,index,arr)=>{
				--arr[index].x;
			})
			this.ghostCoords.forEach((coord,index,arr)=>{
				--arr[index].x;
			})
		}
		this.updateBoundaries();
	}

	moveDown() {
		switch(this.dropType) {
			case "default" : {
				if (framesPassed%SPEED_OF_LEVELS[level-1]==0 && !didTheBlockCollide(this)) {
					this.coords.forEach((coord,index,arr)=>{
						++arr[index].y;
					})
					this.updateBoundaries();
				}
				break;
			};
			case "soft" : {
				if (framesPassed%Math.floor(SPEED_OF_LEVELS[level-1]/6)==0 && !didTheBlockCollide(this)) {
					this.coords.forEach((coord,index,arr)=>{
						++arr[index].y;
					})
					score+=level;
					document.getElementById("score").innerHTML="Score: "+score;
					this.updateBoundaries();
				}
				break;
			};
			case "hard" : {
				while(!didTheBlockCollide(this)) {
					this.coords.forEach((coord,index,arr)=>{
						++arr[index].y;
					})
					score+=2*level;
					this.updateBoundaries();
				}
				document.getElementById("score").innerHTML="Score: "+score;
				break;
			}
		}
	}

	calculateGhost() {
		this.ghostCoords = _.cloneDeep(this.coords);
		this.updateGhostBoundaries();
		while(!didTheGhostCollide(this)) {
			this.ghostCoords.forEach((coord,index,arr)=>{
				++arr[index].y;
			})
			this.updateGhostBoundaries();
		}
	}

	rotate(needsWallKick=false,wallKickType="default",wallKickOffsetIndex=-1) {
		if (this.name!=="O") {
			let successfullyRotated = true;
			let rotatedCoords = _.cloneDeep(this.coords);

			if (needsWallKick) {
				rotatedCoords.forEach((coord,index,arr)=>{
					arr[index].x+=WALL_KICK_OFFSETS[wallKickType][wallKickOffsetIndex].x;
					arr[index].y+=WALL_KICK_OFFSETS[wallKickType][wallKickOffsetIndex].y;
				})
			}

			rotatedCoords.every((coord,index,arr)=>{
				//a forgatási pont ami körül kell forgatni
				const pivot = arr[1];
				//a 90°-os forgatást végző mátrix
				const rotationMatrix = [[0,-1],[1,0]];
				//a blokk abszolút pozíciója a balfelső sarokhoz képest
				//vektor a 0,0 koordinátából amit el kell forgatni
				const v = coord;
				//a relatív vektor a forgatási ponthoz képest
				let vr={};
				//a transzformált relatív vektor, ami már el van forgatva
				let vt={};
				//az elforgatott abszolút vektor
				let rotatedV={};

				vr.x=v.x-pivot.x;
				vr.y=v.y-pivot.y;

				vt.x=rotationMatrix[0][0]*vr.x+rotationMatrix[0][1]*vr.y;
				vt.y=rotationMatrix[1][0]*vr.x+rotationMatrix[1][1]*vr.y;

				rotatedV.x=pivot.x+vt.x;
				rotatedV.y=pivot.y+vt.y;

				if (rotatedV.x<0 || rotatedV.x>9 || rotatedV.y<0 || rotatedV.y>19) {
					successfullyRotated = false;
					return false;
				}

				arr[index]=rotatedV;
				return true;
			})

			if (successfullyRotated) {
				this.coords = rotatedCoords;
			} else if (wallKickOffsetIndex<3){
				this.rotate(true,this.name!=="I"?"default":"I",wallKickOffsetIndex+1);
			}
		}
	}
}

const UPDATE_INTERVAL = 1000/60,
DEFAULT_DROP_TIME = 48,
SOFT_DROP_TIME = 50,
WALL_KICK_OFFSETS = {
	"default": [{x:1,y:0},{x:0,y:1},{x:-1,y:0},{x:0,y:-1}],	
	"I": [{x:2,y:0},{x:0,y:2},{x:-2,y:0},{x:0,y:-2}]
},
//a cellánkénti képkockák száma
SPEED_OF_LEVELS = [48,43,38,33,28,23,18,13,8,6,5,5,5,4,4,4,3,3,3,2,2,2,2,2,2,2,2,2,2,1],
BLOCK_TYPES = [
	{
		name : "I",
		coords : [
			{x:3,y:0},{x:4,y:0},{x:5,y:0},{x:6,y:0}
		]
	},
	{
		name : "J",
		coords : [
			{x:3,y:0},{x:3,y:1},{x:4,y:1},{x:5,y:1}
		]
	},
	{
		name : "L",
		coords : [
			{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:5,y:0}
		]
	},
	{
		name : "O",
		coords : [
			{x:3,y:0},{x:4,y:0},{x:3,y:1},{x:4,y:1}
		]
	},
	{
		name : "S",
		coords : [
			{x:3,y:1},{x:4,y:1},{x:4,y:0},{x:5,y:0}
		]
	},
	{
		name : "T",
		coords : [
			{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:4,y:0}
		]
	},
	{
		name : "Z",
		coords : [
			{x:3,y:0},{x:4,y:0},{x:4,y:1},{x:5,y:1}
		]
	}
];

var infoBox = document.getElementById("info-box"),
gameField = document.getElementById("game-field"),
nextBlockPreview = document.getElementById("next-block-preview").getElementsByClassName("hud-content")[0],
score,
level,
lines,
animationFrameID,
highScore = 0,
activeBlock,
nextBlock,
lastSevenPiece=[],
inactiveBlocks = [],
updateInterval,
framesPassed,
state="stopped";
infoBox.innerHTML = "Press enter to start";

this.addEventListener("keydown",(e)=>{
	switch (e.key) {
		case "Enter" : {
			if (state=="stopped") {
				startGame();
			}
			break;
		}
		case "ArrowLeft" : {
			if (state=="running" && activeBlock) {
				activeBlock.moveLeft();
			}
			break;
		};
		case "ArrowRight" : {
			if (state=="running" && activeBlock) {
				activeBlock.moveRight();
			}
			break;
		};
		case "ArrowUp" : {
			if (state=="running" && activeBlock) {
				activeBlock.rotate();
			}
			break;
		};
		case "ArrowDown" : {
			if (state=="running" && activeBlock) {
				activeBlock.setDropType("soft");
			}
			break;
		};
		case " " : {
			if (state=="running" && activeBlock) {
				activeBlock.setDropType("hard");
			}
			break;
		};
		case "Escape" : {
			if (state==="running") {
				state="paused";
				infoBox.innerHTML = "The game is paused.<br>Press Esc to continue.";
				infoBox.style.display = "block";
			} else if (state==="paused"){
				state="running";
				infoBox.style.display = "none";
			}
			break;
		}
	}
})

this.addEventListener("keyup",(e)=>{
	switch (e.key) {
		case "ArrowDown" : {
			activeBlock.setDropType("default");
			break;
		};
	}
})

for(let y=0;y<20;y++) {
	for(let x=0;x<10;x++) {
		blockDiv = document.createElement("div");
		blockDiv.classList.add("block");
		gameField.appendChild(blockDiv);
	}
}

for(let y=0;y<10;y++) {
	for(let x=0;x<10;x++) {
		blockDiv = document.createElement("div");
		blockDiv.classList.add("block");
		nextBlockPreview.appendChild(blockDiv);
	}
}

function didTheBlockCollide(block) {
	let collided=false;

	if (block.top+block.height<20) {
		block.coords.forEach(coord=>{
			inactiveBlocks.forEach(inactiveBlock=>{
				inactiveBlock.coords.forEach(coords2=>{
					if (coord.y+1==coords2.y && coord.x==coords2.x) {
						if (coord.y==0) {
							state="stopped";
							cancelAnimationFrame(animationFrameID);
							infoBox.innerHTML="Game Over<br>Press Enter to restart!";
							infoBox.style.display="block";
						}

						collided=true;
					}
				})
			})
		})
	} else collided=true;

	if (collided) {
		inactiveBlocks.push(block);
		activeBlock = null;

		if (state=="stopped" && score>highScore) {
			highScore = score;
			document.getElementById("high-score").innerHTML="High Score: "+highScore;
		}
	}

	return collided;
}

function didTheGhostCollide(block) {
	let collided = false;

	if (block.ghostTop+block.ghostHeight<20) {
		block.ghostCoords.forEach(coord=>{
			inactiveBlocks.forEach(inactiveBlock=>{
				inactiveBlock.coords.forEach(coords2=>{
					if (coord.y+1==coords2.y && coord.x==coords2.x) {
						collided=true;
					}
				})
			})
		})
	} else collided=true;

	return collided;
}

function checkLineClear() {
	let linesCleared=0;

	for (let y=0;y<20;y++) {
		let tetrominoBlockCount=0;
		for(let x=0;x<10;x++) {
			if (blockDivs[y*10+x].classList.contains("tetromino") 
				&& !blockDivs[y*10+x].classList.contains("ghost")) {
				++tetrominoBlockCount;
			}
		}

		if (tetrominoBlockCount===10) {
			inactiveBlocks.forEach((block,index,arr)=>{
				arr[index].coords = arr[index].coords.filter(coord=>coord.y!==y);
				block.coords.forEach((coord,index,arr)=>{
					if (coord.y<y) {
						++arr[index].y;
					}
				})
			})
			++linesCleared;
		}
	}

	if (linesCleared) {
		switch(linesCleared) {
			case 1 : {
				score+=100*level;
				break;
			};
			case 2 : {
				score+=300*level;
				break;
			};
			case 3 : {
				score+=500*level;
				break;
			}
		}
		lines += linesCleared;
		document.getElementById("lines").innerHTML="Lines: "+lines;
		document.getElementById("score").innerHTML="Score: "+score;
		if (lines%10==0) {
			framesPassed=0;
			++level;
			document.getElementById("level").innerHTML="Level: "+level; 
		}
	}
}

function generateNextBlock() {
	let generatedNextBlock;

	if (lastSevenPiece.length>0 && lastSevenPiece.length<7) {
		generatedNextBlock = BLOCK_TYPES[Math.floor(Math.random()*BLOCK_TYPES.length)];
		while(lastSevenPiece.includes(generatedNextBlock.name)) {
			generatedNextBlock = BLOCK_TYPES[Math.floor(Math.random()*BLOCK_TYPES.length)];
		}
		lastSevenPiece.push(generatedNextBlock.name);
	} else {
		generatedNextBlock = BLOCK_TYPES[Math.floor(Math.random()*BLOCK_TYPES.length)];
		lastSevenPiece = [generatedNextBlock.name];
	}

	nextBlock = new Block(generatedNextBlock.name,generatedNextBlock.coords);
}

//addig megy lefelé az ábra amíg egyik kockája alatt sincs 1 másik kocka
function update() {
	if (state=="running") {
		blockDivs = Array.from(gameField.getElementsByClassName("block"));
		blockDivs.forEach(div=>{
			div.className = "block";
		})

		nextBlockPreviewDivs = Array.from(nextBlockPreview.getElementsByClassName("block"));
		nextBlockPreviewDivs.forEach(div=>{
			div.className = "block";
		})
		nextBlock.coords.forEach((coord,index,arr)=>{
			nextBlockPreviewDivs[coord.x+(coord.y+4)*10].classList.add("tetromino",nextBlock.name);
		})

		inactiveBlocks.forEach(block=>{
			block.coords.forEach((coord,index,arr)=>{
				blockDivs[coord.x+coord.y*10].classList.add("tetromino",block.name);
			})
		})

		if (activeBlock) {
			activeBlock.calculateGhost();
			activeBlock.ghostCoords.forEach((coord,index,arr)=>{
				blockDivs[coord.x+coord.y*10].classList.add("tetromino",activeBlock.name,"ghost");
			})

			activeBlock.coords.forEach((coord,index,arr)=>{
				blockDivs[coord.x+coord.y*10].classList.add("tetromino",activeBlock.name);
				blockDivs[coord.x+coord.y*10].classList.remove("ghost");
			})
			activeBlock.moveDown();
		} else {
			/*nextBlockDeepCopy = JSON.parse(JSON.stringify(nextBlock));
			activeBlock = new Block(nextBlockDeepCopy.name,nextBlockDeepCopy.coords);*/
			activeBlock = _.cloneDeep(nextBlock);
			generateNextBlock();
		}

		checkLineClear();
		//timePassed+=UPDATE_INTERVAL;
		++framesPassed;
	}
	animationFrameID = requestAnimationFrame(update);
}

function startGame() {
	state="running";
	infoBox.style.display = "none";
	inactiveBlocks=[];
	/*inactiveBlocks=[{
		name : "I",
		coords : [
			{x:0,y:19},{x:1,y:19},{x:2,y:19},{x:3,y:19}
		]
	},
	{
		name : "I",
		coords : [
			{x:7,y:19},{x:4,y:19},{x:5,y:19},{x:6,y:19}
		]
	},
	{
		name : "O",
		coords : [
			{x:9,y:18},{x:8,y:18},{x:9,y:19},{x:8,y:19}
		]
	},{
		name : "I",
		coords : [
			{x:0,y:18},{x:1,y:18},{x:2,y:18},{x:3,y:18}
		]
	},
	{
		name : "I",
		coords : [
			{x:7,y:18},{x:4,y:18},{x:5,y:18},{x:6,y:18}
		]
	},
	{
		name : "O",
		coords : [
			{x:9,y:16},{x:8,y:16},{x:9,y:17},{x:8,y:17}
		]
	},{
		name : "I",
		coords : [
			{x:0,y:17},{x:1,y:17},{x:2,y:17},{x:3,y:17}
		]
	},
	{
		name : "I",
		coords : [
			{x:7,y:17},{x:4,y:17},{x:5,y:17},{x:6,y:17}
		]
	}];*/
	level=1;
	lines=0;
	score=0;
	framesPassed=0;
	document.getElementById("score").innerHTML="Score: "+score;
	document.getElementById("high-score").innerHTML="High Score: "+highScore;
	document.getElementById("level").innerHTML="Level: "+level;
	document.getElementById("lines").innerHTML="Lines: "+lines;

	//legelső blokk generálása
	generateNextBlock();
	activeBlock = _.cloneDeep(nextBlock);
	//következő blokk generálása az előnézethez
	generateNextBlock();

	animationFrameID = requestAnimationFrame(update);
}

