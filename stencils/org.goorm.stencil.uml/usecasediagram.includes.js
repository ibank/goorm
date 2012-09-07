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

//열린 화살표
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