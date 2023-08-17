//------------------------------------INITIAL SETUP------------------------------------
const body = document.body
const canvas = document.createElement("canvas")
const button = document.createElement("button")
canvas.setAttribute("id","canvas")
button.setAttribute("id","start_button")
button.innerHTML = "START"
body.append(canvas)
body.append(button)

const ctx = canvas.getContext("2d")
let CELL_COLOR = "#403939"//#403939
let CELL_SIZE = 20
let CELL_GAP = 1
let r=25
let c=25
let TOT_SIZE = 2*CELL_GAP+CELL_SIZE
canvas.width = c*TOT_SIZE
canvas.height = r*TOT_SIZE

let matrix = []
for(let i=0;i<r;i++)
{
    let row = []
    for(let j=0;j<c;j++)
    {
        row.push(0)
        Fillrect(ctx,CELL_COLOR,formula(i,j),CELL_SIZE,CELL_SIZE)
    }
    matrix.push(row)
}
//---------------------------------Basic tool functions-----------------------------------
function formula(i,j)//index to starting coordinates of cell
{
    return {x:j*TOT_SIZE+CELL_GAP,y:i*TOT_SIZE+CELL_GAP}
}
function getPos(event)
{
    let rect = canvas.getBoundingClientRect()
    let x = parseInt(event.clientX - rect.left)
    let y = parseInt(event.clientY - rect.top)
    return {x,y}
}
function Stroke(ctx,color,width,func){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    func()
    ctx.stroke();
}
function Fillrect(ctx,color,pos,width,height){
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(pos.x,pos.y,width,height);
}

function Line(pos1,pos2,color,width,dotted = false,dash = 5,space = 50){
    Stroke(ctx,color,width,()=>{
        if (dotted){
            ctx.setLineDash([dash, space])
        }
        ctx.moveTo( pos1.x,pos1.y );
        ctx.lineTo( pos2.x,pos2.y );
    })
}
function coord_to_indices(pos)
{
    for(let i=0;i<r;i++)
    {
        for(let j=0;j<c;j++)
        {
            let start = formula(i,j)
            if(pos.x>=start.x && pos.x<=start.x+CELL_SIZE && pos.y>=start.y && pos.y<=start.y+CELL_SIZE)
                return {i,j}
        }
    }
}
function get_cell_color(indices) //if output is 1, then cell alive, else dead
{
    let start = formula(indices.i,indices.j)
    let colors = ctx.getImageData(start.x,start.y,CELL_SIZE,CELL_SIZE).data
    if(colors[0]==0 && colors[1]==128 && colors[2]== 0)
        return 1
    else return 0
}
function drawn_by_cursor(indices)
{
    if(get_cell_color(indices))
        Fillrect(ctx,CELL_COLOR,formula(indices.i,indices.j),CELL_SIZE,CELL_SIZE)
    else
        Fillrect(ctx,"green",formula(indices.i,indices.j),CELL_SIZE,CELL_SIZE)
    matrix[indices.i][indices.j] = 1
}
//-----------------------------------actual stuff---------------------------------------------
canvas.addEventListener("click",function(e){
    let pos = getPos(e)
    let indices = coord_to_indices(pos)
    drawn_by_cursor(indices)
})
button.addEventListener("click",start)

function start()
{
    //console.log(matrix)
    CELL_COLOR = "rgb(29, 28, 28)"
    let id = setInterval(move,100)
    function move()
    {
        change_in_matrix()
        drawn_by_matrix(matrix)
    }
}
function drawn_by_matrix(matrix)
{
    for(let i=0;i<r;i++)
    {
        for(let j=0;j<c;j++)
        {
            if(matrix[i][j])
            {
                Fillrect(ctx,"green",formula(i,j),CELL_SIZE,CELL_SIZE)
            }
            else
            {
                Fillrect(ctx,CELL_COLOR,formula(i,j),CELL_SIZE,CELL_SIZE)
            }
        }
    }
}
function change_in_matrix()
{
    for(let i=0;i<r;i++)
    {
        for(let j=0;j<c;j++)
        {
            let live_neighbours = get_count_live_neighbours({i:i,j:j})
            if(matrix[i][j] == 1)
            {
                if(live_neighbours<2)
                    matrix[i][j] = 0
                else if(live_neighbours == 2 || live_neighbours == 3)
                    matrix[i][j] = 1
                else
                    matrix[i][j] = 0
            }
            else
            {
                if(live_neighbours == 3)
                    matrix[i][j] = 1
                else
                    matrix[i][j] = 0
            }
        }
    }
}
function get_count_live_neighbours(indices)
{
    let i = indices.i
    let j = indices.j
    let n = [{i:i-1,j:j},{i:i+1,j:j},{i:i,j:j+1},{i:i,j:j-1},{i:i+1,j:j+1},{i:i-1,j:j-1},{i:i+1,j:j-1},{i:i-1,j:j+1}]
    let live_neighbours = 0
    for(let i=0;i<8;i++)
    {
        if(n[i].i>=0 && n[i].i<r && n[i].j>=0 && n[i].j<c)
        {
            if(get_cell_color({i:n[i].i,j:n[i].j})) live_neighbours++
        }      
    }
    return live_neighbours
}
//window.requestAnimationFrame
//console.log(get_count_live_neighbours({i:0,j:0}))
//when draw function called, it ALSO draws on a matrix made in the program to repesent the canvas.
//when start button pressed.... an animation function is called. Inside the function, 
//first the required changes are made in the matrix using the game rules.
//second that new matrix is drawn in the canvas
//this animation is repeated