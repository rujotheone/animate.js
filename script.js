// Window width and height
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;

//canvas initializations
const canvas = document.getElementById("canvas");
canvas.style.margin="0 auto";
canvas.style.border="2px solid black";
const ctx = canvas.getContext("2d");

const canvasHeight=Number(canvas.height);
const canvasWidth=Number(canvas.width);


//declare and initialize needed variables
var limitTop=0;
var limitRight=canvasWidth;
var limitLeft=0;
var limitBottom=canvasHeight;
var limits = [limitTop,limitRight,limitBottom,limitLeft];
var movingStep=4
var moving = false; //keeps the state of the animation
var numberOfSteps=0;
var clickedBefore = false;
var farthestTopDot = 0;
var farthestRightDot = 0;
var farthestBottomDot = 0;
var farthestLeftDot = 0;
var offsetX = 0;
var offsetY = 0;
var randomDirection =0;
var looping = true;

//constants needed
const imgObject = document.getElementById("animal");
const dotRadius=7;
const strokeDuration= 3; //milliseconds
const immutableArray = (arr = new Array()) =>{

    return arr.slice();

} 


async function initialLoad()
{
    //main function. Calls other functions
    dots = Array.from(initialDots);

    if(moving==false)
    {
        moving=true;
        // we use Promises because we want drawDots() to completely finish before drawStrokes() 
        drawDots(dots, dotRadius);
        await drawStrokes(dots,0);
        //Event handlers for buttons    
        document.getElementById("animate").addEventListener("click", handleAnimation);
        document.getElementById("clear").addEventListener("click", clearEvent);      
    }
     
      
}
                                     

async function drawDots(dots, radius){     
    
    ctx.fillStyle = 'black';
    let dotlength =dots.length;
    let firstelement = dots[0];    

    //to ensure strokes connect back to first dot
    if (dots[dotlength-1] != firstelement)
    {
        dots.push(firstelement);
        
    }
    dots.forEach(dot => {
    //arc(x,y,r,start,end)
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, 2 * Math.PI);    
    ctx.fill();   
   });   
    
}

//delay argument keeps track of the speed of drawStrokes needed. 0 is slowest, 2 is instant
async function drawStrokes(dots, delay=0){

    return new Promise(function(resolve, reject){

        ctx.lineWidth =7;
        var i=0; //counter  

        const draw = () =>{
            ctx.beginPath();
            grd = ctx.createLinearGradient(dots[i].x,dots[i].y, dots[i+1].x,dots[i+1].y);
            ctx.moveTo(dots[i].x, dots[i].y);
    
            grd.addColorStop(0,"blue");
            grd.addColorStop(0.5,"red");
            grd.addColorStop(1,"yellow");
             
             
            ctx.strokeStyle = grd;
            ctx.lineTo(dots[i+1].x, dots[i+1].y);        
            ctx.stroke();             
        }

        if(delay == 0){
            const drawInterval =  setInterval(function(){       
            
                draw();            
                i++;
        
                if (i === dots.length - 1) {
                    clearInterval(drawInterval);  
                    
                    setTimeout(() => {
                        moveAnimal(ctx,limits, 1, dots);
                        //showAnimal(ctx); 
                    }, 1);
                }                    
                
            }, strokeDuration);
        }

        if(delay==1) 
        {
            const drawInterval =  setInterval(function(){           
                draw();            
                i++;
    
            if (i === dots.length - 1) {
                clearInterval(drawInterval);  // Stop the setInterval loop after reaching the last dot
                
                setTimeout(() => {                
                    //showAnimal(ctx,farthestLeftDot+offsetX-9,farthestTopDot+offsetY-9)
                    
                    moveAnimal(ctx,limits, randomDirection, dots); //jump                     

                }, 1);
                }                    
                
        }, strokeDuration);       
        }  

        if(delay==2) 
        {
            draw();
        } 

    resolve();

    })              
}

//checks moving variable to know state of animation
const handleAnimation = () => {    

    //handle mutability of arrays, need immutable array
    dots = JSON.parse(JSON.stringify(coords)); 

    const begin_dots = dots.slice(); 
    const stop_dots = dots.slice(); 
    console.log(moving);    

    // If it is not running, then begin animation when the button is clicked.
    if(!moving) {  
        console.log(looping);
        beginAnimation(begin_dots);
    }
    // If it is already runnning, the stop the animation.
    else {
      stopAnimation(stop_dots);
    }
  }

async function beginAnimation(dots, repeat=false){            
    
    document.getElementById("animate").innerText="Stop";

        moving = true;  
        looping = true;

        randomDirection =  Math.floor(Math.random() * (3.5 - 0) + 0);
        console.log(randomDirection);

        // get the farthest coordinates in each direction
        farthestTopDot = getFarthestPoint(dots, 0);    
        farthestRightDot = getFarthestPoint(dots, 1);
        farthestBottomDot = getFarthestPoint(dots, 2);
        farthestLeftDot = getFarthestPoint(dots, 3);

        //calculation to get the middle of the canvas
        offsetX = (canvasWidth - (farthestRightDot - farthestLeftDot))/2;
        offsetY = (canvasHeight - (farthestBottomDot - farthestTopDot))/2;

        dots.forEach((dot,index) => {
            dots[index].x= dot.x +offsetX;
            dots[index].y= dot.y +offsetY;

        })    

        clickedBefore= true;
        clearCanvas();    
        drawDots(dots,dotRadius);        

        drawStrokes(dots, 1)
            .then(() => {              
                setTimeout(()=>{
                    //showAnimal(ctx,farthestLeftDot+offsetX,farthestTopDot+offsetY)
                },0) // 
            })
            .catch((error) => {
                console.error(error); // Handle any errors that occurred during drawing
            });   
            //generate random directions that animation will move to      
}

async function stopAnimation(dots){    

    document.getElementById("animate").innerText="Begin";
    moving = false; 
    looping = false; 
    farthestTopDot = getFarthestPoint(dots, 0);    
    farthestRightDot = getFarthestPoint(dots, 1);
    farthestBottomDot = getFarthestPoint(dots, 2);
    farthestLeftDot = getFarthestPoint(dots, 3);
    let offsetX = (canvasHeight - (farthestRightDot - farthestLeftDot))/2;
    let offsetY = (windowHeight - (farthestBottomDot - farthestTopDot))/2;    
    clearCanvas();    
    drawDots(dots,dotRadius);
    await sleep(10); 
            
}

const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);       
}

const clearEvent = () => {

    //we need to do some extra things when clear button is clicked
    document.getElementById("animate").innerText="Begin";
    moving = false;
    looping= false;
    return clearCanvas();
}

//shows the animal picture
function showAnimal(ctx, x=0, y=0){
    return new Promise (resolve => ctx.drawImage(imgObject, x ,y));    
}

const sleep = (ms) => {
    //function to introduce delays
    return new Promise(resolve => setTimeout(resolve, ms));
}

//returns farthest point based on direction given
function getFarthestPoint(dots, direction){

    if(direction==0)
    {        
        const top = dots.reduce((top, obj) => {
            return obj.y < top ? obj.y : top;
          }, Infinity);
          return top
    }
    if(direction==1)
    {
        const right = dots.reduce((right, obj) => {
            return obj.x > right ? obj.x : right;
          }, -Infinity);
          return right
    }
    if(direction==2)
    {
        const bottom = dots.reduce((bottom, obj) => {
            return obj.y > bottom ? obj.y : bottom;
          }, -Infinity);
          return bottom
    }
    if(direction==3)
    {
        const left = dots.reduce((left, obj) => {
            return obj.x < left ? obj.x : left;
          }, Infinity);
          return left
    }
}

//move the animal picture
async function moveAnimal(ctx,limits, direction, iniDots ){    
    
    
    const dots = Array.from(iniDots);       
    var farthestPoint= getFarthestPoint(dots, direction);    
    const numberOfDots=dots.length;     

    /**To move the image, we constantly update the position of the dots, clear canvas
     * draw dots and draw strokes and show image with new position coordinates in the given direction
     **/ 

    if(direction == 1 || direction == 2){
        while(farthestPoint+28 < limits[direction]){        

            dots.forEach((dot, index) => {
                //up
                if(direction == 0 && index != numberOfDots - 1) 
                {
                    dot.y = dot.y - movingStep;               
                }
                //right
                else if(direction == 1 && index != numberOfDots - 1)
                {
                    dot.x = dot.x + movingStep  ;                              
                }
                //down
                else if(direction == 2 && index != numberOfDots - 1)
                {
                    dot.y = dot.y  + movingStep;
                }
                //left
                else if(direction == 3 && index != numberOfDots - 1)
                {
                    dot.x = dot.x - movingStep ;
                }
                else 
                {
                    
                    //moving = false;
                }
            });               
            
            
                dots[numberOfDots-1] = dots[0];
                farthestPoint+=movingStep;
                firstLeftPoint=  getFarthestPoint(dots, 3);    
                firstTopPoint =  getFarthestPoint(dots, 0);   
                firstBottomPoint=  getFarthestPoint(dots, 2);    
                firstRightPoint =  getFarthestPoint(dots, 1);          

                await sleep(10);
                clearCanvas();
                drawDots(dots,dotRadius);
                drawStrokes(dots,2);
                showAnimal(ctx,firstLeftPoint-7,firstTopPoint-9); 
                numberOfSteps++; 
                     
        
        }  
    }    

    if(direction == 0 || direction == 3){
        while(farthestPoint > limits[direction]){        

            dots.forEach((dot, index) => {
                //up
                if(direction == 0 && index != numberOfDots - 1) 
                {
                    dot.y = dot.y - movingStep;               
                }
                //right
                else if(direction == 1 && index != numberOfDots - 1)
                {
                    dot.x = dot.x + movingStep  ;                              
                }
                //down
                else if(direction == 2 && index != numberOfDots - 1)
                {
                    dot.y = dot.y  + movingStep;
                }
                //left
                else if(direction == 3 && index != numberOfDots - 1)
                {
                    dot.x = dot.x - movingStep ;
                }
                else 
                {
                    
                    //moving = false;
                }
            });        
        
            
                dots[numberOfDots-1] = dots[0];
            farthestPoint-=movingStep;
            firstLeftPoint=  getFarthestPoint(dots, 3);    
            firstTopPoint =  getFarthestPoint(dots, 0);   
            firstBottomPoint=  getFarthestPoint(dots, 2);    
            firstRightPoint =  getFarthestPoint(dots, 1);          

            await sleep(10);
            clearCanvas();
            drawDots(dots,dotRadius);
            drawStrokes(dots,2);
            showAnimal(ctx,firstLeftPoint-7,firstTopPoint-9); 
            numberOfSteps++; 
                       
        
       }
    }
            
}

//load main function
loaded = initialLoad();
loaded.then(() => {
                moving=false;        
            })
            .catch((error) => {
                console.error(error); // Handle any errors that occurred during drawing
            });  

