var canvasWidth = Math.min( 800 , $(window).width() - 20 )
var canvasHeight = canvasWidth
var strokeColor = "black"
var isMouseDown = false
var lastLoc = {x:0,y:0}
var lastTimestamp = 0
var lastLineWidth = -1
var thisLine = []
var thisLineWidth = []
var moves = []
var move = []
var i,j
var char
var canvas = document.getElementById("canvas")
var context = canvas.getContext("2d")

canvas.width = canvasWidth
canvas.height = canvasHeight

$("#controller").css("width",canvasWidth+"px")
drawGrid()
get()
$("#clear_btn").click(//清除
    function(e){
        context.clearRect( 0 , 0 , canvasWidth, canvasHeight )
        drawGrid()
    }
)
$("#post_btn").click(//发送
    function(e){
		post()
    }
)
$("#play_btn").click(//发送
    function(e){
		context.clearRect( 0 , 0 , canvasWidth, canvasHeight )
		drawGrid()
		drawCharcter(char, context)
    }
)
$(".color_btn").click(
    function(e){
        $(".color_btn").removeClass("color_btn_selected")
        $(this).addClass("color_btn_selected")
        strokeColor = $(this).css("background-color")
    }
)
function get(){
	context.clearRect( 0 , 0 , canvasWidth, canvasHeight )
	drawGrid()
	return $.ajax({
		url:"./index.php/Welcome/output",
		dataType:"json",
		success:function(result) {
			char = result
			drawCharcter(result,context)
		}
	})
}
function post(){
	for (var i = 0; i < moves.length; i++) {
		$.ajax({
			url:"./index.php/welcome/input",
			type:"post",
			data:{data:moves[i],move:i},
			dataType:"json",
			success:function(result){console.log(result)}
		})
	}

}
function beginStroke(point){

    isMouseDown = true
    //console.log("mouse down!")
    lastLoc = windowToCanvas(point.x, point.y)
    lastTimestamp = new Date().getTime();
}
function endStroke(){
    isMouseDown = false
	if (!move.length==0) {moves.push(move)}
	move = []
	console.log(moves)
}
function moveStroke(point){
    var curLoc = windowToCanvas( point.x , point.y );
    var curTimestamp = new Date().getTime();
    var s = calcDistance( curLoc , lastLoc )
    var t = curTimestamp - lastTimestamp

    var lineWidth = calcLineWidth( t , s );

    //draw
    context.beginPath();
    context.moveTo( lastLoc.x , lastLoc.y );
    context.lineTo( curLoc.x , curLoc.y );

    context.strokeStyle = strokeColor
    context.lineWidth = lineWidth
    context.lineCap = "round"
    context.lineJoin = "round"
    context.stroke()

	move.push({p1:lastLoc, p2:curLoc, width:lineWidth})
    lastLoc = curLoc
    lastTimestamp = curTimestamp
    lastLineWidth = lineWidth
}

canvas.onmousedown = function(e){
    e.preventDefault()
    beginStroke( {x: e.clientX , y: e.clientY} )
};
canvas.onmouseup = function(e){
    e.preventDefault()
    endStroke()


};
canvas.onmouseout = function(e){
    e.preventDefault()
    endStroke()
};
canvas.onmousemove = function(e){
    e.preventDefault()
    if( isMouseDown ){
        moveStroke({x: e.clientX , y: e.clientY})
    }
};

canvas.addEventListener('touchstart',function(e){
    e.preventDefault()
    touch = e.touches[0]
    beginStroke( {x: touch.pageX , y: touch.pageY} )
});
canvas.addEventListener('touchmove',function(e){
    e.preventDefault()
    if( isMouseDown ){
        touch = e.touches[0]
        moveStroke({x: touch.pageX , y: touch.pageY})
    }
});
canvas.addEventListener('touchend',function(e){
    e.preventDefault()
    endStroke()
});

var maxLineWidth = 30;
var minLineWidth = 1;
var maxStrokeV = 10;
var minStrokeV = 0.1;
function calcLineWidth( t , s ){

    var v = s / t;

    var resultLineWidth;
    if( v <= minStrokeV )
        resultLineWidth = maxLineWidth;
    else if ( v >= maxStrokeV )
        resultLineWidth = minLineWidth;
    else{
        resultLineWidth = maxLineWidth - (v-minStrokeV)/(maxStrokeV-minStrokeV)*(maxLineWidth-minLineWidth);
    }

    if( lastLineWidth == -1 )
        return resultLineWidth;

    return resultLineWidth/5 + lastLineWidth*4/5;
}

function calcDistance( loc1 , loc2 ){

    return Math.sqrt( (loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y - loc2.y)*(loc1.y - loc2.y) )
}

function windowToCanvas( x , y ){
    var bbox = canvas.getBoundingClientRect()
    return {x:Math.round(x-bbox.left) , y:Math.round(y-bbox.top)}
}
function drawCharcter( char , context ){
	var temp = 0
	var moveAStep = drawACharacter( char , context )
	for (var i = 0; i < char.length; i++) {
		for (var j = 0; j < char[i].length; j++) {
			setTimeout(
				function(){
					moveAStep()
				},
				temp+=1000/char[i][j].width
			)
		}
	}
}
function drawACharacter(char , context){
	var i = j = 0
	return function(){
		if (char[i][j]==undefined) {
			i++
			j = 0
		}
		line = char[i][j]
		context.beginPath();
		context.moveTo( line.x1 , line.y1 );
		context.lineTo( line.x2  , line.y2 );

		context.strokeStyle = strokeColor
		context.lineWidth = line.width
		context.lineCap = "round"
		context.lineJoin = "round"
		context.stroke()
		j++
	}
}
function drawGrid(){

    context.save()

    context.strokeStyle = "rgb(230,11,9)"

    context.beginPath()
    context.moveTo( 3 , 3 )
    context.lineTo( canvasWidth - 3 , 3 )
    context.lineTo( canvasWidth - 3 , canvasHeight - 3 )
    context.lineTo( 3 , canvasHeight - 3 )
    context.closePath()
    context.lineWidth = 6
    context.stroke()

    context.beginPath()
    context.moveTo(0,0)
    context.lineTo(canvasWidth,canvasHeight)

    context.moveTo(canvasWidth,0)
    context.lineTo(0,canvasHeight)

    context.moveTo(canvasWidth/2,0)
    context.lineTo(canvasWidth/2,canvasHeight)

    context.moveTo(0,canvasHeight/2)
    context.lineTo(canvasWidth,canvasHeight/2)

    context.lineWidth = 1
    context.stroke()

    context.restore()
}
function sleep(delay){
  return function(){
    return new Promise(function(resolve, reject){
      setTimeout(resolve, delay);
    });
  }
}
