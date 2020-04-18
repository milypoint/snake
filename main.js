// --- CONFIG ---
let colour = {
    'white': "#FFFFFF",
    'black': "#000000",

};

let arrow_key = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};
// --- end CONFIG ---


// --- MAIN ---
window.addEventListener('load', onPageLoaded);
// --- end MAIN ---


// --- EVENTS
function onPageLoaded()
{
    // Creating objects:
    let canvas = new CanvasFrame("canvas");
    let player = new DotPlayer(100, 100, 1);
    canvas.addObject(player);


    // Make event listeners:
    // window.addEventListener('keydown', onKeyDown);
    // window.addEventListener('keyup', onKeyAction);
    window.addEventListener('keydown', function (e) {
        player.onArrowKeyDown(onKeyDown(e));
    });
}

function onKeyDown(e) {
    let keynum;
    if(window.event) { // IE
        keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera
        keynum = e.which;
    }
    console.log(getKeyByValue(arrow_key, keynum));
    return getKeyByValue(arrow_key, keynum);

}
// --- end EVENTS


// --- TOOLS ---
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function xor(foo, bar)
{
    return ((foo && !bar) || (!foo && bar));
}
// --- end TOOLS

class CanvasFrame
{
    new_frame = false;
    config = {
        'height': 0,
        'width': 0,
        'dot_size': 10
    };
    draw_objects = [];

    constructor(canvas_id)
    {
        this.can = document.getElementById(canvas_id);
        this.hdc = this.can.getContext('2d');
        this.config.height = parseInt(this.can.getAttribute("height"));
        this.config.width = parseInt(this.can.getAttribute("width"));

        this.canvasReset();
        this.render_interval = setInterval(this.renderFrame.bind(this), 20); //1000/60
        this.logic_interval = setInterval(this.gameLogic.bind(this), 20);
    }

    /**
     *
     * @param {DynamicObject} obj
     */
    addObject(obj)
    {
        this.draw_objects.push(obj);
    }

    canvasReset()
    {
        this.hdc.strokeStyle = 'red';
        this.hdc.lineWidth = this.config.dot_size;
        // Set background color:

        this.hdc.fillStyle = colour.white;
        this.hdc.fillRect(0,0, this.config.width, this.config.height);
    }

    addLine(x, y, _x, _y)
    {
        this.hdc.moveTo(x, y);
        this.hdc.lineTo(_x, _y);
    }

    addDot(x, y)
    {
        this.hdc.fillStyle = colour.black;
        this.hdc.fillRect(
            x - this.config.dot_size/2,
            y - this.config.dot_size/2,
            this.config.dot_size,
            this.config.dot_size
        );
    }

    renderFrame()
    {
        if (this.new_frame) {
            this.hdc.stroke();
            this.new_frame = false;
        }

    }

    gameLogic()
    {
        this.canvasReset();
        // this.addDot(this.draw_objects[0], this.draw_objects[1]);
        // if ((this.draw_objects[0] < this.config.width -10) && (this.draw_objects[1] < this.config.height-10)){
        //     this.draw_objects[1] += 1;
        // }
        // this.draw_objects.forEach(obj => function () {
        this.draw_objects.forEach(function (obj) {
            // console.log(obj);
            let speed = obj.speed;
            let direction = obj.direction;
            if ((speed > 0) && (direction !== null)) {
                switch (direction) {
                    case 'left':
                        obj.x -= speed * this.config.dot_size;
                        if (!obj.validateObject(this)) {
                            obj.x += speed * this.config.dot_size; // restore
                        }
                        break;
                    case 'up':
                        obj.y -= speed * this.config.dot_size;
                        if (!obj.validateObject(this)) {
                            obj.y += speed * this.config.dot_size; // restore
                        }
                        break;
                    case 'right':
                        obj.x += speed * this.config.dot_size;
                        if (!obj.validateObject(this)) {
                            obj.x -= speed * this.config.dot_size; // restore
                        }
                        break;
                    case 'down':
                        obj.y += speed * this.config.dot_size;
                        if (!obj.validateObject(this)) {
                            obj.y -= speed * this.config.dot_size; // restore
                        }
                        break;
                }
            }
            obj.drawToCanvas(this);
        }, this);
        this.new_frame = true;
        // console.log(this.draw_objects);
    }
}


class DynamicObject
{
    /**
     * CONSTRUCTOR
     * @param {int} x Position by X axis.
     * @param {int} y Position by Y axis.
     * @param {int} [speed=0]
     * @param {(string|null)} [direction=null] in ['left', 'up', 'right', 'down', null]
     */
    constructor(x, y, speed = 0, direction = null)
    {
        this.x = x;
        this.y = y;
        this.setSpeed(speed);
        this.setDirection(direction);
    }

    /**
     * Change speed of dynamic object.
     * @param {int} speed
     */
    setSpeed(speed)
    {
        this.speed = speed;
    }

    /**
     * Change direction of dynamic object.
     * Cannot set direction opposite to current direction.
     * If direction === null then current speed set as 0.
     * @param {(string|null)} direction in ['left', 'up', 'right', 'down', null]
     */
    setDirection(direction) {
        console.log('_');
        console.log(this.direction);
        if (direction === null) {
            this.direction = direction;
            this.speed = 0;

            console.log(this.direction);
            return;
        } else if (this.direction === null) {
            this.direction = direction;

            console.log(this.direction);
            return;
        }
        // Cannot set direction opposite to current direction:
        if ((arrow_key[this.direction] !== (arrow_key[direction] - 2)) &&
            (arrow_key[this.direction] !== (arrow_key[direction] + 2))) {
            this.direction = direction;
        }
        console.log(this.direction);
    }

    /**
     * @param {CanvasFrame} can
     */
    validateObject(can)
    {
        if ((this.x < 0) ||
            (this.x > can.config.width) ||
            (this.y < 0) ||
            (this.y > can.config.height)
        ) {
            return false;
        }
        return true;
    }
}


class Player extends DynamicObject
{
    /**
     *
     * @param {string} key in ['left', 'up', 'right', 'down']
     */
    onArrowKeyDown(key)
    {
        this.setSpeed(1);
        this.setDirection(key);
    }
}

/**
 * Presents Player as simple dot.
 */
class DotPlayer extends Player
{
    /**
     *
     * @param {CanvasFrame} canvas
     */
    drawToCanvas(canvas)
    {
        canvas.addDot(this.x, this.y);
    }

}



// class Snake
// {
//     /*
//     @input:  array [[x0, y0], [x1, y1], ..., [xn, yn]],
//     where [x0, y0] - head of stake, [xn, yn] - end of snake, and middle points means turns of snake.
//     Two adjacent points must be on one straight line parallel to one of the axes: (x1 == x2 or y1 == x2) etc.
//      */
//     constructor(nodes = [[0, 0], [0, 0]])
//     {
//         this.nodes = nodes;
//     }
//
//     /*
//     Adds node after snake head.
//     @input: x, y - point of node. Must be not equal to head of snake.
//      */
//     addNode(x, y)
//     {
//         if (xor(x === this.nodes[0][0], y === this.nodes[0][1])) {
//             console.log(1);
//             this.nodes.splice(1, 0, [x, y]);
//         }
//     }
// }


