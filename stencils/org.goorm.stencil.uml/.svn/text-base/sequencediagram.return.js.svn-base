var length = parseInt(Math.sqrt((tempEX-this.properties.sx)*(temp_sx-this.properties.sx)+(tempEY-this.properties.sy)*(tempEY-this.properties.sy)));
var radian = Math.acos((tempEX-this.properties.sx)/length);

var minus = 1;
 
if (this.properties.sy > tempEY) {
	minus = -1;
}

context.save();

context.translate(this.properties.sx, this.properties.sy);

context.rotate(minus * radian);

//왼쪽 - 열린 화살표
context.beginPath();
context.strokeStyle = this.properties.color;
//굵어진 만큼 이동
context.lineWidth = parseFloat(this.properties.thickness);
context.moveTo((8 + parseFloat(this.properties.thickness)), (4 + parseFloat(this.properties.thickness)));
context.lineTo(0, 0);
context.stroke();						
context.lineTo((8 + parseFloat(this.properties.thickness)), -( 4 + parseFloat(this.properties.thickness)));
context.stroke();						
context.closePath();

context.restore();
