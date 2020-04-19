// --- CONFIG ---
let colour = {
    'white': "#FFFFFF",
    'black': "#000000",
    'red': "#ff0000",

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
    // let player = new DotPlayer(100, 100, 1);
    let player = new SnakePlayer(400, 100);
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
        // this.hdc.strokeStyle = 'red';
        // this.hdc.lineWidth = this.config.dot_size;

        // Set background color:
        this.hdc.beginPath();
        this.hdc.fillStyle = colour.white;
        this.hdc.fillRect(0,0, this.config.width, this.config.height);
    }

    addLine(x, y, _x, _y, col=colour.black)
    {
        this.hdc.beginPath();
        this.hdc.strokeStyle = col;
        this.hdc.moveTo(x, y);
        this.hdc.lineTo(_x, _y);
        this.hdc.lineWidth = this.config.dot_size/2;
        this.hdc.stroke();

    }

    addDot(x, y, col=colour.black)
    {
        this.hdc.beginPath();
        this.hdc.fillStyle = col;
        this.hdc.fillRect(
            x - this.config.dot_size/2/2,
            y - this.config.dot_size/2/2,
            this.config.dot_size/2,
            this.config.dot_size/2
        );
        this.hdc.stroke();

    }

    gameLogic()
    {
        this.canvasReset();

        this.draw_objects.forEach(function (obj) {
            // console.log(obj);
            let speed = obj.speed;
            let direction = obj.direction;
            if ((speed > 0) && (direction !== null)) {
                switch (direction) {
                    case 'left':
                        // obj.x -= speed * this.config.dot_size;
                        obj.set_x(obj.x - speed * this.config.dot_size);
                        if (!obj.validateObject(this)) {
                            // obj.x += speed * this.config.dot_size; // restore
                            obj.set_x(obj.x + speed * this.config.dot_size); // restore

                        }
                        break;
                    case 'up':
                        // obj.y -= speed * this.config.dot_size;
                        obj.set_y(obj.y - speed * this.config.dot_size);
                        if (!obj.validateObject(this)) {
                            // obj.y += speed * this.config.dot_size; // restore
                            obj.set_y(obj.y + speed * this.config.dot_size); // restore

                        }
                        break;
                    case 'right':
                        // obj.x += speed * this.config.dot_size;
                        obj.set_x(obj.x + speed * this.config.dot_size);

                        if (!obj.validateObject(this)) {
                            // obj.x -= speed * this.config.dot_size; // restore
                            obj.set_x(obj.x - speed * this.config.dot_size);

                        }
                        break;
                    case 'down':
                        // obj.y += speed * this.config.dot_size;
                        obj.set_y(obj.y + speed * this.config.dot_size);
                        if (!obj.validateObject(this)) {
                            // obj.y -= speed * this.config.dot_size; // restore
                            obj.set_y(obj.y - speed * this.config.dot_size);
                        }
                        break;
                }
            }
            obj.drawToCanvas(this);
            // if(obj.speed == 1) {
            //     clearInterval(this.logic_interval);
            // }
        }, this);
        this.new_frame = true;
        console.log(this.draw_objects);
    }
}


class DynamicObject
{


    // x = null;
    // y = null;

    set x(value)
    {
        this._x = value;
        this.active_turn = false;
    }

    get x()
    {
        return this._x;
    }

    set y(value)
    {
        this._y = value;
        this.active_turn = false;
    }

    get y()
    {
        return this._y;
    }

    /**
     * @param {boolean} value
     */
    set active_turn(value)
    {
        this._active_turn = value;
        if (value) {
            this.onTurnEvent();
        }
    }

    get active_turn()
    {
        return this._active_turn
    }

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
        this.active_turn = false;
        this.setSpeed(speed);
        this.setDirection(direction);
        this.init_object();
    }

    init_object() {}

    onTurnEvent() {}

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
        if (this.active_turn) {
            return;
        }
        console.log('_');
        console.log(this.direction);
        if (direction === null) {
            this.direction = direction;
            this.speed = 0;

            console.log(this.direction);
            return;
        } else if (this.direction === null) {
            this.direction = direction;
            this.active_turn = true;
            console.log(this.direction);
            return;
        }
        // Cannot set direction opposite to current direction:
        if ((arrow_key[this.direction] !== (arrow_key[direction] - 2)) &&
            (arrow_key[this.direction] !== (arrow_key[direction] + 2))) {
            this.active_turn = true;
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


/**
 * Array nodes [[x0, y0], [x1, y1], ..., [xn, yn]],
 * where [x0, y0] - head of stake, [xn, yn] - end of snake, and middle points means turns of snake.
 * Two adjacent points must be on one straight line parallel to one of the axes: (x1 == x2 or y1 == x2) etc.
 */
class SnakePlayer extends Player
{
    /**
     * @var {Array.<Array.<int>>} nodes Points that construct the snake.
     */
    init_object()
    {
        this.nodes = [[this.x, this.y]]
        this.addNode((this.x - 400), this.y)
        this.direction = 'right';
    }

    set_x(value)
    {
        this.nodes[0][0] = value;
        let shift = Math.abs(this.x - value);
        this.moveNodes(shift);
        this.x = value;



    }

    set_y(value)
    {
        this.nodes[0][1] = value;
        let shift = Math.abs(this.y - value);
        this.moveNodes(shift);
        this.y = value;



    }

    onTurnEvent() {
        super.onTurnEvent();
        this.addNode(this.x, this.y);

    }

    /**
     * @param {int} shift Absolute shift of head
     */
    moveNodes(shift) {
        // for (let i = 1; i < (this.nodes.length); i++){
        //     let node = this.nodes[this.nodes.length -i];
        //     let prev_node = this.nodes[this.nodes.length -i-1];
        //
        //     if (node[0] == prev_node[0]) {
        //         node[1] += Math.sign(prev_node[1] - node[1]) * shift
        //         continue;
        //     }
        //     if (node[1] == prev_node[1]) {
        //          node[0] += Math.sign(prev_node[0] - node[0]) * shift
        //         continue;
        //     }
        // }
        let end_node = this.nodes[this.nodes.length - 1];
        let prevend_node = this.nodes[this.nodes.length - 2];
        console.log(`shift: ${shift}`);
        console.log(`end_node: ${end_node} prevend_node ${prevend_node}`);
        if (end_node[0] === prevend_node[0]) {
            console.log(Math.sign(prevend_node[1] - end_node[1]) * shift);
            end_node[1] += Math.sign(prevend_node[1] - end_node[1]) * shift;
        } else if (end_node[1] === prevend_node[1]) {
            console.log(Math.sign(prevend_node[0] - end_node[0]) * shift);
            end_node[0] += Math.sign(prevend_node[0] - end_node[0]) * shift;
        }
        if ((end_node[0] === prevend_node[0]) && (end_node[1] === prevend_node[1])) {
            console.log(true);
            this.nodes.splice(this.nodes.length - 2, 1);
        }
        console.log(`end_node: ${this.nodes[this.nodes.length - 1]} prevend_node ${this.nodes[this.nodes.length - 2]}`);
        console.log(this.nodes);



    }

    /**
     * Adds node after snake head.
     * [x, y] - point of node. Must be not equal to head of snake.
     * @param {int} x
     * @param {int} y
     */
    addNode(x, y)
    {
        // if (xor(x === this.nodes[0][0], y === this.nodes[0][1])) {
        //     this.nodes.splice(1, 0, [x, y]);
        // }
        if ((x === this.nodes[0][0]) || (y === this.nodes[0][1])) {
            this.nodes.splice(1, 0, [x, y]);
        }
    }

    drawToCanvas(canvas)
    {
        for (let i = 0; i < (this.nodes.length - 1); i++) {
            let x = this.nodes[i][0];
            let y = this.nodes[i][1];
            let x_ = this.nodes[i + 1][0];
            let y_ = this.nodes[i + 1][1];
            canvas.addLine(x, y, x_, y_);
            canvas.addDot(x, y, colour.black);

        }
        canvas.addDot(this.x, this.y, colour.red);

    }
}


