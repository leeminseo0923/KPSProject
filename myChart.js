rangeArray = [0,12,0,120];

var canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d'),
    width = canvas.width,
    height = canvas.height,
    plotFunction = function plot(fn, range, style) {
        var widthScale = (width / (range[1] - range[0])),
            heightScale = (height / (range[3] - range[2])),
            first = true;
        
        ctx.beginPath();
        
        for (var x = 2*widthScale; x < width; x++) {
            var xFnVal = (x / widthScale) - range[0],
                yGVal = (fn(xFnVal) - range[2]) * heightScale;
            
            yGVal = height - yGVal; // 0,0 is top-left
            if (first) {
                ctx.moveTo(x, yGVal);
                first = false;
            }
            else {
                ctx.lineTo(x, yGVal);
            }
        }
        
        ctx.strokeStyle = style;
        ctx.lineWidth = 2;
        ctx.stroke(); 
    };


function drawAxis(range, style){

    var widthScale = (width / (range[1] - range[0])),
        heightScale = (height / (range[3] - range[2]));

    ctx.beginPath();

    for (var x = 0; x <= width; x += widthScale){
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (var y = 0; y <= height; y += heightScale){
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }

    ctx.strokeStyle = style;
    ctx.lineWidth = 1;
    ctx.stroke();
}

var A = 19.61, p = 2.0, B = 0.491;
var tD = 2.7;
var k = 13.5, alpha = 1;
IEEE = function(x) {
    return tD * ((A/(Math.pow(x, p)-1))+B);
}

IEC = function(x) {
    return tD * (k/(Math.pow(x, alpha)-1));
}

var selectedFunction = IEEE


plotFunction(selectedFunction, rangeArray, 'black');




scatterPlot = function(range, data, style){
    
    var widthScale = (width / (range[1] - range[0])),
    heightScale = (height / (range[3] - range[2]));


    pos = [0,0];
    pos[0] = data[0] * widthScale;
    pos[1] = data[1] * heightScale;

    ctx.beginPath();

    ctx.arc(pos[0], height-pos[1], 2, 0, 2*Math.PI, false);
    ctx.fillStyle = style;
    ctx.fill();
};

function drawLine(range, data, style){

    d = data.slice();

    var widthScale = (width / (range[1] - range[0])),
    heightScale = (height / (range[3] - range[2]));

    pos = d[0].slice();
    d.shift();
    pos[0] = pos[0] * widthScale;
    pos[1] = pos[1] * heightScale;
    ctx.beginPath();
    
    ctx.moveTo(pos[0], height - pos[1]);


    d.forEach(item=> {
        pos = item.slice();

        pos[0] = pos[0] * widthScale;
        pos[1] = pos[1] * heightScale;

        ctx.lineTo(pos[0], height - pos[1]);
        ctx.strokeStyle = style;
    
        ctx.lineWidth = 0.8;
    
        ctx.stroke();
    })


}

const functionMenu = document.getElementById('function');
const inverseMenu = document.getElementById('inverse');
const timeDialSet = document.getElementById('timeDial');

functionMenu.addEventListener('change', (ev)=>{ // changefunction
    var selectFunction = functionMenu.options[functionMenu.selectedIndex].value;

    if(selectFunction == 'IEEE'){
        selectedFunction = IEEE; // select function


        inverseMenu.childNodes[3].disabled = false; // change selectable option
        inverseMenu.childNodes[7].disabled = true;
        inverseMenu.childNodes[9].disabled = true;

        inverseMenu.selectedIndex = 0; // reset selected option
    }
    else{
        selectedFunction = IEC; //select function

        inverseMenu.childNodes[3].disabled = true; // change selectable option
        inverseMenu.childNodes[7].disabled = false;
        inverseMenu.childNodes[9].disabled = false;

        inverseMenu.selectedIndex = 0; // reset selected option
    }

    refresh();
    plotFunction(selectedFunction, rangeArray, 'black');
});



inverseMenu.addEventListener('change', (ev)=>{ //change inverse
    var selectInverse = inverseMenu.options[inverseMenu.selectedIndex].value;

    if (selectedFunction == IEEE){
        switch(selectInverse){
            case "Mod":
                A = 0.0515;
                B = 0.114;
                p = 0.02;
                break;
            case "Very":
                A = 19.61;
                B = 0.491;
                p = 2.0;
                break;
            case "Extreme":
                A = 28.2;
                B = 0.1217;
                p = 2.0;
                break;
            default:
                console.log('error');
                break;
        }
    }
    else if (selectedFunction == IEC){
        switch(selectInverse){
            case "Standard":
                k = 0.14;
                alpha = 0.02;
                break;
            case "Very":
                k = 13.5;
                alpha = 1;
                break;
            case "Extreme":
                k = 80;
                alpha = 2;
                break;
            case "Longtime":
                k = 120;
                alpha = 1;
                break;
            default:
                console.log('error');
                break;
        }
    }

    refresh();
    plotFunction(selectedFunction, rangeArray, 'black')
});

timeDialSet.addEventListener('change', (ev)=>{

    tD = timeDialSet.value;

    refresh();
    plotFunction(selectedFunction, rangeArray, 'black')
})

window.addEventListener("keydown", (e) => { // when enter key down, enterValue will run
    if(e.key == 'Enter'){
        enterValue(selectedFunction);
    }
})

enterValue = function(fn){
    refresh(); //refresh canvas
    plotFunction(fn, rangeArray, 'black'); // redraw function

    data = document.getElementsByClassName('value');

    td_data = document.getElementsByTagName('td'); // get x data tag

    x_data = [];

    for (let index = 0; index<5; index++){ //pretreat x data
        x_data.push(Number(td_data[index].innerText));

    }

    returnData = [];


    for (let index = 0; index < data.length; index++) {
        var element = data[index];
        if (element.value == ''){
            continue;
        }

        returnData.push([x_data[index], Number(element.value)]);

    } //pretreat y data and emerge x, y data

    isFault = false;

    line_style = 'blue';
    if (returnData.length != 0){

        returnData.forEach(item => {
            if (errorCheck(fn, item)){ // find fault data
                style = 'red';
                isFault = true;
                line_style = 'red'
            }
            else{
                style = 'blue'
            }
            
            scatterPlot(rangeArray, item, style) // scatter experimental data
            
        });
        
        drawLine(rangeArray, returnData, line_style);


        if (isFault){ // if Fault
            header = document.getElementById('header');
            header.innerHTML = 'Bad'
            header.style.color = 'red'
        }
        else{ // if Not Fault
            header = document.getElementById('header');
            header.innerHTML = 'Good'
            header.style.color = 'Blue'
        }
    }
}

errorCheck = function(fn, checkdata){ // find Fault data

    idealValue = fn(checkdata[0]); //theoritical Value
    realValue = checkdata[1]; // experimental value
    acceptableError = idealValue * 0.02; // error range
    if (realValue > acceptableError + idealValue || realValue < idealValue - acceptableError){
        return true;
    }
    else{
        return false;
    }
}

refresh = function(){ // refresh Canvas
    ctx.clearRect(0,0,width, height);
}

