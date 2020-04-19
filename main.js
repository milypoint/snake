const _ = undefined;

// --- CONFIG ---
let colour = {
    'white': "#FFFFFF",
    'black': "#000000",
    'light_grey': "#7d7d7d",
    'red': "#ff0000",
    'green': "#00ff0b",
    'light_green': "#b0ff9e",
};

let arrow_key = {
    'left': 37,
    'up': 38,
    'right': 39,
    'down': 40
};

let control_key = {
    'esc': 27,
    'space': 32
};
// --- end CONFIG ---


// --- EVENTS
window.addEventListener('load', onPageLoaded);

function onPageLoaded()
{
    // Creating objects:
    let canvas = new CanvasFrame("canvas");
    // let player = new DotPlayer(100, 100, 1);
    let player = new SnakePlayer(400, 100);
    canvas.addObject(player);
    let apple = new AppleObject(600, 400);
    canvas.addObject(apple);



    // Make event listeners:
    window.addEventListener('keydown', function (e) {
        let keynum = onKeyDown(e);
        if (getKeyByValue(arrow_key, keynum) !== undefined) {
            player.onArrowKeyDown(getKeyByValue(arrow_key, keynum));
            return;
        }
        if (getKeyByValue(control_key, keynum) !== undefined) {
            canvas.onControlKeyPressed(getKeyByValue(control_key, keynum));
        }
    });
}

function onKeyDown(e) {
    let keynum;
    if(window.event) { // IE
        keynum = e.keyCode;
    } else if(e.which){ // Netscape/Firefox/Opera
        keynum = e.which;
    }
    return keynum;

}
// --- end EVENTS


// --- TOOLS ---
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function xor(foo, bar) { return ((foo && !bar) || (!foo && bar)); }
// --- end TOOLS

/**
 * @var {Object.<string, number>} cfg
 * @var {Array} objects
 */
class CanvasFrame {
    cfg = {
        'height': 0,
        'width': 0,
        'step': 10
    };
    objects = [];
    can;
    hdc;
    game_tick_interval;


    /**
     * @param {string} canvas_id
     */
    constructor(canvas_id) {
        this.can = document.getElementById(canvas_id);
        this.hdc = this.can.getContext('2d');
        this.cfg.height = parseInt(this.can.getAttribute("height"));
        this.cfg.width = parseInt(this.can.getAttribute("width"));

        this.startStopGame();

    }

    /**
     * Calls whenever any of {control_kay} pressed.
     * @param {control_key} key
     */
    onControlKeyPressed(key) {
        if (key === 'space') {
            this.startStopGame();
        }
    }

    /**
     * Switch between ON or OFF of game action.
     */
    startStopGame() {
        if (this.game_tick_interval !== undefined) {
            clearInterval(this.game_tick_interval);
            this.game_tick_interval = undefined;
        } else {
            this.game_tick_interval = setInterval(this.gameTick.bind(this), 50);
        }
    }

    /**
     * Adds static or dynamic object into object list.
     * @param {DynamicObject|StaticObject} obj
     */
    addObject(obj) {
        this.objects.push(obj);
    }

    /**
     * Clear canvas frame and draw base background.
     */
    canvasReset() {
        this.hdc.beginPath();
        this.hdc.fillStyle = colour.white;
        this.hdc.fillRect(0, 0, this.cfg.width, this.cfg.height);

        //make grid:
        for (let x = 0; x <= this.cfg.width; x += this.cfg.step) {
            this.addLine(x, 0, x, this.cfg.height, colour.light_grey, 1);
        }
        for (let y = 0; y <= this.cfg.height; y += this.cfg.step) {
            this.addLine(0, y, this.cfg.width, y, colour.light_grey, 1);
        }
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} _x
     * @param {number} _y
     * @param {colour=} col
     * @param {number=} thin
     */
    addLine(x, y, _x, _y, col = colour.black, thin = this.cfg.step) {
        this.hdc.beginPath();
        this.hdc.strokeStyle = col;
        this.hdc.moveTo(x, y);
        this.hdc.lineTo(_x, _y);
        this.hdc.lineWidth = thin;
        this.hdc.stroke();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {colour=} col
     * @param {number=} thin
     */
    addDot(x, y, col = colour.black, thin = this.cfg.step) {
        this.hdc.beginPath();
        this.hdc.fillStyle = col;
        this.hdc.fillRect(x - thin / 2, y - thin / 2, thin, thin);
        this.hdc.stroke();
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number=} r
     * @param {number=} start_angle
     * @param {number=} end_angle
     * @param {colour=} col
     */
    addCycle(x, y, r=this.cfg.step, start_angle=0, end_angle=2*Math.PI, col=colour.black)
    {
        this.hdc.beginPath();
        this.hdc.fillStyle = col;
        this.hdc.strokeStyle = colour.black;
        this.hdc.lineWidth = 1;
        this.hdc.arc(x, y, r, start_angle, end_angle);
        this.hdc.stroke();
        this.hdc.fill();
    }

    /**
     * Game tick logic.
     */
    gameTick() {
        this.canvasReset();
        this.objects.forEach(function (obj) {
            if (obj instanceof DynamicObject) {
                let result = obj.move(this.cfg.step, this.isPointInCanvas);
            }
            obj.drawToCanvas(this);
        }, this);
        console.log(this.objects);
    }

    /**
     * Checks is point [x, y] inside af canvas frame.
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isPointInCanvas = function (x, y) {
        return !((x < 0) || (x > this.cfg.width) || (y < 0) || (y > this.cfg.height));
    }.bind(this);
}

/**
 * Class presents static object. Still can be moved by changing coordinates.
 */
class StaticObject
{
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    /**
     * @param {CanvasFrame} canvas
     */
    drawToCanvas(canvas) {}
}


/**
 * Class presents dynamic object, that have himself speed, direction.
 */
class DynamicObject
{
    /**
     * "Abstract" functions
     */
    init_object() {}
    onTurnEvent() {}
    onXSet(prev_x) {}
    onYSet(prev_y) {}
    onObjectHit(obj) {}


    /**
     * @param {int} value
     */
    set x(value) {
        let prev_x = this.x;
        this._x = value;
        this.active_turn = false;
        this.onXSet(prev_x);
    }

    get x() { return this._x; }

    /**
     * @param {int} value
     */
    set y(value) {
        let prev_y = this.y;
        this._y = value;
        this.active_turn = false;
        this.onYSet(prev_y);
    }

    get y() { return this._y; }

    /**
     * Sets true after direction changed but false after object has moved.
     * @param {boolean} value
     */
    set active_turn(value)
    {
        this._active_turn = value;
        if (value) {
            this.onTurnEvent();
        }
    }

    get active_turn() { return this._active_turn; }

    /**
     * Change speed of dynamic object.
     * @param {int} speed
     */
    set speed(speed) { this._speed = speed; }

    get speed() { return this._speed; }

    /**
     * Change direction of dynamic object.
     * Cannot set direction opposite to current direction.
     * If direction === null then current speed set as 0.
     * @param {(string)} direction Must be in ['left', 'up', 'right', 'down']
     */
    set direction(direction) {
        // Cannot make turn before previous turn complete.
        // Cannot change direction to <null>.
        // direction must be typeof string.
        if ((this.active_turn) || !(typeof direction === 'string' || direction instanceof String)) {
            return;
        }
        if (this.direction === undefined) {
            this._direction = direction;
            this.active_turn = true;
        } else
        // Cannot set direction opposite to current direction:
        if ((arrow_key[this.direction] !== (arrow_key[direction] - 2)) &&
            (arrow_key[this.direction] !== (arrow_key[direction] + 2))) {
            if (this.direction !== direction) {
                this.active_turn = true;
                this._direction = direction;
            }

        }
        console.log(`Direction sets to: ${this.direction}`);
    }

    get direction() { return this._direction;}

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
        this.speed = speed;
        this.direction = direction;
        this.init_object();
    }

    /**
     * @param {int} step
     * @param {function(number, number): boolean} isPointInCanvas Function CanvasFrame.isPointInCanvas
     */
    move(step, isPointInCanvas)
    {
        if ((this.speed > 0) && (this.direction !== undefined)) {
            switch (this.direction) {
                case 'left':
                    if (isPointInCanvas(this.x - this.speed * step, this.y)) {
                        this.x -= this.speed * step;
                        return true;
                    }
                    break;
                case 'up':
                    if (isPointInCanvas(this.x, this.y - this.speed * step)) {
                        this.y -= this.speed * step;
                        return true;
                    }
                    break;
                case 'right':
                    if (isPointInCanvas(this.x + this.speed * step, this.y)) {
                        this.x += this.speed * step;
                        return true;
                    }
                    break;
                case 'down':
                    if (isPointInCanvas(this.x, this.y + this.speed * step)) {
                        this.y += this.speed * step;
                        return true;
                    }
                    break;
            }
            return false;
        }
    }
}


/**
 * Presents dynamic object that can be controlled by input of user.
 */
class Player extends DynamicObject
{
    /**
     * @param {string} key Must be in ['left', 'up', 'right', 'down']
     */
    onArrowKeyDown(key)
    {
        this.speed = 1;
        this.direction = key;
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
     * @var {Array.<Array.<int>>} nodes List of points that construct the snake.
     */
    init_object()
    {
        this.nodes = [[this.x, this.y]];
        this.addNode((this.x - 100), this.y);
        this.direction = 'right';
    }

    /**
     * Calls whenever X sets.
     * @param {number} prev_x X value before change.
     */
    onXSet(prev_x)
    {
        if (this.nodes === undefined) { return; }
        this.nodes[0][0] = this.x;
        let shift = Math.abs(prev_x - this.x);
        this.moveNodes(shift);
    }

    /**
     * Calls whenever Y sets.
     * @param {number} prev_y Y value before change.
     */
    onYSet(prev_y)
    {
        if (this.nodes === undefined) { return; }
        this.nodes[0][1] = this.y;
        let shift = Math.abs(prev_y - this.y);
        this.moveNodes(shift);
    }

    /**
     * Calls whenever changes direction of object.
     */
    onTurnEvent() {
        super.onTurnEvent();
        this.addNode(this.x, this.y);
    }

    /**
     * @param {int} shift Absolute shift of head
     */
    moveNodes(shift) {
        let end_node = this.nodes[this.nodes.length - 1];
        let prev_node = this.nodes[this.nodes.length - 2];
        if (end_node[0] === prev_node[0]) {
            end_node[1] += Math.sign(prev_node[1] - end_node[1]) * shift;
        } else if (end_node[1] === prev_node[1]) {
            end_node[0] += Math.sign(prev_node[0] - end_node[0]) * shift;
        }
        if ((end_node[0] === prev_node[0]) && (end_node[1] === prev_node[1])) {
            this.nodes.splice(this.nodes.length - 2, 1);
        }
    }

    /**
     * Adds node after snake head.
     * [x, y] - point of node. Must be not equal to head of snake.
     * @param {int} x
     * @param {int} y
     */
    addNode(x, y)
    {
        if ((x === this.nodes[0][0]) || (y === this.nodes[0][1])) {
            this.nodes.splice(1, 0, [x, y]);
        }
    }

    /**
     * Called by canvas game logic whenever this object have hit to other object.
     * Used for track when snake hit an apple.
     * @param {DynamicObject|StaticObject} obj
     */
    onObjectHit(obj)
    {
        
    }

    /**
     * @param {CanvasFrame} canvas
     */
    drawToCanvas(canvas)
    {
        for (let i = 0; i < (this.nodes.length - 1); i++) {
            let x = this.nodes[i][0];
            let y = this.nodes[i][1];
            let x_ = this.nodes[i + 1][0];
            let y_ = this.nodes[i + 1][1];
            canvas.addLine(x, y, x_, y_);
            canvas.addDot(x, y, colour.green);
        }
        canvas.addDot(this.x, this.y, colour.red);

    }
}

/**
 * Apple that snake like to eat.
 */
class AppleObject extends StaticObject
{
    drawToCanvas(canvas)
    {
        canvas.addCycle(this.x, this.y, 5, _, _, colour.light_green);
    }
}


