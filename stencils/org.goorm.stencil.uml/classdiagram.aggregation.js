var length = parseInt(Math.sqrt((tempEX-this.properties.sx)*(tempEX-this.properties.sx)+(tempEY-this.properties.sy)*(tempEY-this.properties.sy)));
var radian = Math.acos((tempEX-this.properties.sx)/length);

var minus = 1;
 
if (tempEY < this.properties.sy) {
	minus = -1;
}

context.save();

context.translate(this.properties.sx, this.properties.sy);

context.rotate(minus * radian);

//왼쪽

//사각형
/*
context.beginPath();
context.strokeStyle = "#666666";						
context.rect(0, -5, 10, 10);
context.closePath();
context.lineWidth = 1;
context.stroke();
context.fillStyle = "#FFF";
context.fill();

*/

//마름모

context.rotate(Math.PI/4);

context.beginPath();
context.strokeStyle = "#000";						
context.rect(0, -7, 8, 8);
context.closePath();
//context.lineWidth = 1;
context.lineWidth = parseFloat(this.properties.thickness);
context.stroke();
context.fillStyle = "#FFF";
context.fill();




//채운 화살표
/*
context.beginPath();
context.strokeStyle = "#666666";
context.moveTo(10, 5);
context.lineTo(0, 0);
context.lineTo(10, -5);
context.closePath();
context.lineWidth = 1;
context.stroke();
context.fillStyle = "#000";
context.fill();
*/


context.restore();



var length = parseInt(Math.sqrt((this.properties.ex-temp_sx)*(this.properties.ex-temp_sx)+(this.properties.ey-temp_sy)*(this.properties.ey-temp_sy)));
var radian = Math.acos((this.properties.ex-temp_sx)/length);

var minus = 1;
 
if (this.properties.ey < temp_sy) {
	minus = -1;
}



//오른쪽
context.save();

context.translate(this.properties.ex, this.properties.ey);

context.rotate(minus * radian);


//오른쪽

//그냥 화살표
context.beginPath();
context.strokeStyle = this.properties.color;
//굵어진 만큼 이동
context.lineWidth = parseFloat(this.properties.thickness);
context.moveTo(0-(8 + parseFloat(this.properties.thickness)), 0-(4 + parseFloat(this.properties.thickness)));
context.lineTo(0, 0);
context.stroke();						
context.lineTo(0-(8 + parseFloat(this.properties.thickness)), 4 + parseFloat(this.properties.thickness));
context.stroke();						
context.closePath();

context.restore();