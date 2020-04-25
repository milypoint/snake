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
    let canvas = new CanvasFrame("canvas", 400, 400);
    let player = canvas.spawnObject(SnakePlayer);
    let apple = canvas.spawnObject(AppleObject);
    canvas.addObject(apple);
    // Add Teleport objects to canvas:
    for (let i = 0; i <= canvas.height; i += canvas.step) {
        canvas.addObject(new Teleport(canvas.width, i, 0, i));
        canvas.addObject(new Teleport(0, i, canvas.width, i));
    }
    for (let i = 0; i <= canvas.width; i += canvas.step) {
        canvas.addObject(new Teleport(i, 0, i, canvas.height));
        canvas.addObject(new Teleport(i, canvas.height, i, 0));
    }

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

/**
 * Remove value from array.
 * EX: arr = [1, 2, 3, 4], value = 3 then return [1, 2, 4]
 * @param {Array} arr
 * @param {?} value
 * @return {?}
 */
function arrayRemValue(arr, value)
{
    return arr.filter(function(ele){
        return ele !== value;
    });
}

/**
 * Calculate distance between two points a and b
 * @param {Array.<number, number>} a
 * @param {Array.<number, number>} b
 * @returns {number}
 */
function distance(a, b) {
    return Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
}

/**
 * Checks is point "c" is between points "a" and "b" on line "ab".
 * @param {Array.<number, number>} a
 * @param {Array.<number, number>} b
 * @param {Array.<number, number>} c
 * @returns {boolean}
 */
function is_between(a, b, c) {
    return (distance(a,c) + distance(c,b)) === distance(a,b)
}

function update_debug(id, value)
{
    let element = document.getElementById(id);
    if (element !== null) {
        element.innerHTML = value.toString();
    }
}

/**
 * Compere two arrays.
 * @param {[]} arr1
 * @param {[]} arr2
 * @returns {boolean}
 */
function isEqualsArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0, l = arr1.length; i < l; i++) {
        // Check if we have nested arrays
        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!isEqualsArrays(arr1[i], arr2[i])) {
                return false;
            }
        } else if (arr1[i] !== arr2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
// --- end TOOLS ---


// --- CLASSES ---
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

    set height(value)
    {
        this.cfg.height = value;
        this.can.setAttribute('height', value);
    }

    get height() { return this.cfg.height; }

    set width(value)
    {
        this.cfg.width = value;
        this.can.setAttribute('width', value);
    }

    get width() { return this.cfg.width; }

    set step(value)
    {
        this.cfg.step = value;
    }

    get step() { return this.cfg.step; }

    /**
     * @param {string} canvas_id
     * @param {number|null} width
     * @param {number|null} height
     */
    constructor(canvas_id, width=null, height=null)
    {
        this.can = document.getElementById(canvas_id);
        this.hdc = this.can.getContext('2d');
        this.width = (width === null) ? parseInt(this.can.getAttribute("width")) : width;
        this.height = (height === null) ? parseInt(this.can.getAttribute("height")) : height;

        this.game_die = false;

        this.startStopGame();

    }

    /**
     * Calls whenever any of {control_kay} pressed.
     * @param {string} key
     */
    onControlKeyPressed(key) {
        switch (key) {
            case 'space':
                this.startStopGame();
                break;
            case 'esc':
                this.nextTick();
        }
    }

    /**
     * Switch between ON or OFF of game action.
     */
    startStopGame()
    {
        if (this.game_tick_interval !== undefined) {
            clearInterval(this.game_tick_interval);
            this.game_tick_interval = undefined;
        } else {
            if (!this.game_die === true) {
                this.game_tick_interval = setInterval(this.gameTick.bind(this), 100);
            }
        }
    }

    nextTick()
    {
        if (this.game_tick_interval === undefined) {
            if (!this.game_die === true) {
                setTimeout(this.gameTick.bind(this), 100);
            }
        }
    }

    /**
     * Adds static or dynamic object into object list.
     * @param {Object.<DynamicObject>|Object.<StaticObject>} obj
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
    addCycle(x, y, r = this.cfg.step, start_angle = 0, end_angle = 2 * Math.PI, col = colour.black) {
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
        // console.log('start tick');
        this.canvasReset();
        this.objects.forEach(function (obj) {
            if (obj instanceof DynamicObject) {
                let result = obj.move(this.cfg.step, this.isPointInCanvas);
                if (!result) {
                    console.log(result);
                    this.game_die = true;
                    this.startStopGame();
                }
                if (!obj.validate()) {
                    this.game_die = true;
                    this.startStopGame();
                }
                // Check if DynamicObject hits some object:
                let hit = this.isObjectHit(obj);
                // console.log(hit);
                if (hit !== null) {
                    // console.log('hit');
                    obj.onObjectHit(hit);

                    if (hit instanceof AppleObject) {
                        this.objects = arrayRemValue(this.objects, hit);
                        this.spawnObject(AppleObject);
                    }
                }
            }
            obj.drawToCanvas(this);
            if (obj instanceof SnakePlayer) {
                console.log(obj);
            }
        }, this);
        // console.log(this.objects);
        // console.log('end tick');
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

    /**
     * Check if object hits another object:
     * @param {Object.<DynamicObject>|Object.<StaticObject>} object
     * @return {Object.<DynamicObject>|Object.<StaticObject>|null}
     */
    isObjectHit(object) {
        let result = null;
        this.objects.forEach(function (obj) {
            if (object !== obj) {
                if ((object.x === obj.x) && (object.y === obj.y)) {
                    result = obj;
                }
            }
        });
        return result;
    }

    /**
     * Spawns object on canvas frame.
     * @param {DynamicObject|StaticObject} class_obj
     * @param {number|null} x
     * @param {number|null} y
     * @return {*}
     */
    spawnObject(class_obj, x=null, y=null)
    {
        if ((x === null) || (y === null)) {
            x = this.randomPoint()[0];
            y = this.randomPoint()[1];
        }
        if (!this.isPointInCanvas(x, y)) {
            x = this.randomPoint()[0];
            y = this.randomPoint()[1];
        }
        let obj = new class_obj(x, y);
        this.objects.push(obj);
        return obj;
    }

    randomPoint()
    {
        let x = Math.ceil((Math.random() * this.cfg.width) / this.cfg.step) * this.cfg.step;
        let y = Math.ceil((Math.random() * this.cfg.height) / this.cfg.step) * this.cfg.step;
        return [x, y];
    }
}


/**
 * Class presents static object. Still can be moved by changing coordinates.
 */
class StaticObject
{
    init_object() {}
    /**
     * @param {number} x
     * @param {number} y
     */
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.init_object();
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
    turn_que = [];
    /**
     * "Abstract" functions
     */
    init_object() {}
    onTurn() {}
    onXSet(prev_x) {}
    onYSet(prev_y) {}
    validate() { return true; }

    onObjectHit(obj)
    {
        if (obj instanceof Teleport) {
            console.log('Hit teleport.');
            // Pass x,y setters:
            this._x = obj.to()[0];
            this._y = obj.to()[1];
        }
    }

    onMove()
    {
        this.active_turn = false;
        if (this.turn_que.length) {
            this.direction = this.turn_que.shift();
        }
    }

    /**
     * @param {number} value
     */
    set x(value) {
        let prev_x = this.x;
        this._x = value;
        this.onXSet(prev_x);
        if (prev_x !== value) {
            this.onMove();
        }
    }

    get x() { return this._x; }

    /**
     * @param {number} value
     */
    set y(value) {
        let prev_y = this.y;
        this._y = value;
        this.onYSet(prev_y);
        if (prev_y !== value) {
            this.onMove();
        }
    }

    get y() { return this._y; }

    /**
     * Sets true after direction changed but false after object has moved.
     * @param {boolean} value
     */
    set active_turn(value)
    {
        this._active_turn = value;
        if (this.direction !== undefined) {
            update_debug('direction', this.direction);
        }
        if ((value) && (this.direction !== undefined)) {
            this.onTurn();
        }
    }

    get active_turn() { return this._active_turn; }

    /**
     * Change speed of dynamic object.
     * @param {number} speed
     */
    set speed(speed) { this._speed = speed; }

    get speed() { return this._speed; }

    /**
     * Change direction of dynamic object.
     * Cannot set direction opposite to current direction.
     * If direction === null then current speed set as 0.
     * @param {string} direction Must be in ['left', 'up', 'right', 'down']
     */
    set direction(direction) {

        function validate_direction(prev_direction, direction) {
            return ((arrow_key[prev_direction] !== (arrow_key[direction] - 2)) &&
                (arrow_key[prev_direction] !== (arrow_key[direction] + 2)));
        }

        // Cannot make turn before previous turn complete.
        // Cannot change direction to <null>.
        // direction must be typeof string.
        if (!(typeof direction === 'string' || direction instanceof String)) { return; }

        if (this.active_turn) {
            if (this.turn_que.length < 2) {
                if (validate_direction((this.turn_que.length) ?
                    this.turn_que[this.turn_que.length - 1] :
                    this.direction,
                    direction
                ))
                {
                    this.turn_que.push(direction);

                }
            }
            return;
        }
        if (this.direction === undefined) {
            this._direction = direction;
            this.active_turn = true;
        } else
        // Cannot set direction opposite to current direction:
        if (validate_direction(this.direction, direction)) {
            if (this.direction !== direction) {
                this.active_turn = true;
                this._direction = direction;
                console.log(`Direction sets to: ${this.direction}`);
            }
        }
    }

    get direction() { return this._direction;}

    /**
     * CONSTRUCTOR
     * @param {int} x Position by X axis.
     * @param {int} y Position by Y axis.
     * @param {int} [speed=0]
     * @param {string|null} [direction=null] in ['left', 'up', 'right', 'down', null]
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
     * @param {function(number, number): boolean} isPointInCanvas Function from CanvasFrame.isPointInCanvas
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
        return true;
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
        this.addNode([this.x-300, this.y]);
        // Set direction without calling setter:
        this._direction = 'right';
        //set active_turn to false because its actually not turn but init direction.
        this.active_turn = false;
        this.apple_value = 0;
        update_debug('head', [this.x, this.y]);
        update_debug('nodes', this.nodes);
        update_debug('direction', this.direction);
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
        update_debug('head', [this.x, this.y]);
        update_debug('nodes', this.nodes);
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
        update_debug('head', [this.x, this.y]);
        update_debug('nodes', this.nodes);
    }

    /**
     * Calls whenever changes direction of object.
     */
    onTurn() {
        super.onTurn();
        this.addNode([this.x, this.y]);
    }

    validate()
    {
        if (this.nodes.length <= 2) {
            return true;
        }
        let head = [this.x, this.y];
        for (let i = 1; i < (this.nodes.length - 1); i++) {
            if (isEqualsArrays(head, this.nodes[i])) continue;

            if (is_between(
                (this.nodes[i] instanceof Teleport) ? this.nodes[i].from() : this.nodes[i],
                (this.nodes[i+1] instanceof Teleport) ? this.nodes[i+1].to() : this.nodes[i+1],
                head
            )) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param {number} shift Absolute shift of head
     */
    moveNodes(shift) {
        let end_node = this.nodes[this.nodes.length - 1];
        let prev_node = this.nodes[this.nodes.length - 2];
        console.log('MoveNodes debug:');
        console.log(`nodes: ${this.nodes}`);
        // Check is prev node is teleport object. If so then get teleport "from" point:
        prev_node = (prev_node instanceof Teleport) ? prev_node.from() : prev_node;

        // If shifting bigger then distance to next node than shift last node to previous and then recursive call this
        // function again with rest shifting value (on the end of this function).
        let dist = distance(end_node, prev_node);
        if (shift > dist) { //Ex: 3 > 2
            dist = shift - dist; //=1
            shift = shift - dist; //=2
        } else {
            dist = 0;
        }

        if (end_node[0] === prev_node[0]) { // if x are same
            if (this.apple_value === 0) {
                end_node[1] += Math.sign(prev_node[1] - end_node[1]) * shift;
            } else {
                this.apple_value -= 1;
            }
        } else if (end_node[1] === prev_node[1]) { //if y are same
            if (this.apple_value === 0) {
                end_node[0] += Math.sign(prev_node[0] - end_node[0]) * shift;
            } else {
                this.apple_value -= 1;
            }
        }
        if ((end_node[0] === prev_node[0]) && (end_node[1] === prev_node[1])) {
            // If previous node is Teleport object then teleport end node to destination point.
            if (this.nodes[this.nodes.length - 2] instanceof Teleport) {
                console.log('Prev node is Teleport');
                this.nodes[this.nodes.length - 1] = this.nodes[this.nodes.length - 2].to();
            }
            console.log(`end_node_after: ${this.nodes[this.nodes.length - 1]}`);
            this.nodes.splice(this.nodes.length - 2, 1);
        }
        console.log('End debug.')

        // Recursive call with rest shifting value.
        if (dist) {
            this.moveNodes(dist);
        }
    }

    /**
     * Adds node after snake head.
     * [x, y] - point of node. Must be not equal to head of snake.
     * @param {number} x
     * @param {number} y
     */
    // addNode(x, y)
    // {
    //     // Check is node coordinates and head are on a line parallel to one of the axes.
    //     if ((x === this.nodes[0][0]) || (y === this.nodes[0][1])) {
    //         this.nodes.splice(1, 0, [x, y]);
    //     }
    // }

    /**
     * Adds node after snake head.
     * @param {number[]|Object.<Teleport>} node Is array [x, y]
     */
    addNode(node)
    {
        let x;
        let y;
        if (node instanceof Teleport) {
            // console.log('11111434324sdfsdf');
            x = node.from()[0];
            y = node.from()[1];
        } else {
            if (node.length !== 2) return;
            x = node[0];
            y = node[1];
        }
        // console.log(`${x} ${y}`);
        if ((x === this.nodes[0][0]) || (y === this.nodes[0][1])) {
            // console.log(true);
            this.nodes.splice(1, 0, node);
        }
    }

    /**
     * Called by canvas game logic whenever this object have hit to other object.
     * Used for track when snake hit an apple.
     * @param {Object.<DynamicObject>|Object.<StaticObject>} obj
     */
    onObjectHit(obj)
    {
        super.onObjectHit(obj);
        if (obj instanceof AppleObject) {
            console.log('Hit apple.');
            this.apple_value = obj.value;
            return;
        }
        if (obj instanceof Teleport) {
            this.addNode(obj);
            this.nodes[0] = obj.to();
            // console.log(this);
        }
    }

    /**
     * @param {Object.<CanvasFrame>} canvas
     */
    drawToCanvas(canvas)
    {
        for (let i = 0; i < (this.nodes.length - 1); i++) {
            let x; let y; let x_; let y_;

            if (this.nodes[i] instanceof Teleport) {
                x = this.nodes[i].from()[0];
                y = this.nodes[i].from()[1];
            } else {
                x = this.nodes[i][0];
                y = this.nodes[i][1];
            }

            if (this.nodes[i+1] instanceof Teleport) {
                x_ = this.nodes[i+1].to()[0];
                y_ = this.nodes[i+1].to()[1];
            } else {
                x_ = this.nodes[i+1][0];
                y_ = this.nodes[i+1][1];
            }

            canvas.addLine(x, y, x_, y_);
            canvas.addDot(x, y, colour.green);
        }
        canvas.addDot(this.x, this.y, colour.red);
        let last = this.nodes[this.nodes.length-1];
        canvas.addDot(last[0], last[1], colour.green);
        console.log('draw end');
    }
}


class Teleport
{
    set x(value)
    {
        if (value === 0) this._x = 0;
        else this._x = value;
    }

    get x() {
        return this._x;
    }

    set y(value)
    {
        if (value === 0) this._y = 0;
        else this._y = value;
    }

    get y() {
        return this._y;
    }

    constructor(x ,y, x_to, y_to) {
        this.x = x;
        this.y = y;
        this.x_to = x_to;
        this.y_to = y_to;
    }

    to()
    {
        return [this.x_to, this.y_to];
    }

    from()
    {
        return [this.x, this.y];
    }

    drawToCanvas(canvas)
    {
        canvas.addDot(this.x, this.y, colour.green)
    }
}


/**
 * Apple that snake like to eat.
 * @var {number} value Means how many point adds to snake.
 */
class AppleObject extends StaticObject
{
    drawToCanvas(canvas)
    {
        canvas.addCycle(this.x, this.y, 5, _, _, colour.light_green);
    }

    init_object()
    {
        this.value = 1;
    }
}



