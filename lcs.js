const crypto = require("crypto");
const readline = require('readline');
const { Console } = require('console');
const { Transform } = require('stream');
let arguments = process.argv;
arguments.splice(0, 2);
let ky;

const key = () => {
    const k = crypto.randomBytes(32);
    return k.toString('hex');
};

const r = (a) => {
    const { randomInt, } = require('node:crypto');
    return randomInt(1, a);
}

function signKey(key, msg) {
    return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

function c(m, a) {
    let n = m.splice(m.indexOf(a));
    return n.concat(m);
}

const f = (m, a) => m.splice(1, (m.length % 2) + 1).includes(a);

const k = (m, a, b) => {
    if (!m.includes(a)) {
        return false;
    }
    console.log(`Your move: ${arguments[a - 1]}`);
    console.log(`Computer move: ${arguments[b - 1]}`);
    if (a === b) {
        return 'Draw';
    }
    return f(c(m, a), b) ? 'You lose!' : 'You win!';
}

function rdl(m, b, arg) {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(`Enter your move: `, (move) => {
        if (move === '0') {
            rl.close();
            console.log('Finished!');
            return;
        }

        if (move === '?') {
            rl.close();
            hlp(arg);
            rdl(m, b, arg);
        }
        else {
            let req = k(m, Number(move), b);
            if (req === false) {
                console.log(`${move} is incorrect! Try again!`);
                rl.close();
                rdl(m, b, arg);
            }
            else {
                console.log(req);
                console.log(`HMAC key: ${ky}`);
                rl.close();
            }
        }
    });
}

function cn(args) {
    if (args.length === 0 || args === null) {
        console.log('Enter arguments');
        return;
    }
    const len = args.length;
    if (!(len % 2)) {
        console.log('Number of arguments isn\'t an odd number! Try again!');
        return;
    }
    if (len < 3) {
        console.log('Number of arguments is less than three! Try again!');
        return;
    }

    if (Array.from(new Set(args)).length !== len) {
        console.log('Some arguments are repaeted!');
        return;
    }
    ky = key();
    const rdm = r(len);
    const newArg = [];
    console.log(signKey(ky, args[rdm - 1]));
    for (let i = 0; i < len; i++) {
        console.log(`${i + 1} - ${args[i]}`);
        newArg.push(i + 1);
    }
    console.log(`0 - exit`);
    console.log(`? - help`);
    rdl(newArg, rdm, args);
}


function o(keys, val) {
    const o = new Object();
    keys.map((el, n) => {
        o[el] = val[n];
    });
    return o;
}

function table(input) {
    const ts = new Transform({ transform(chunk, enc, cb) { cb(null, chunk) } })
    const logger = new Console({ stdout: ts })
    logger.table(input)
    const table = (ts.read() || '').toString()
    let result = '';
    for (let row of table.split(/[\r\n]+/)) {
        let r = row.replace(/[^┬]*┬/, '┌');
        r = r.replace(/^├─*┼/, '├');
        r = r.replace(/│[^│]*/, '');
        r = r.replace(/^└─*┴/, '└');
        r = r.replace(/'/g, ' ');
        result += `${r}\n`;
    }
    console.log(result);
}

function hlp(arg) {
    console.log(arg);
    let thd = ['v PC\\User >'];
    thd = thd.concat(arg);
    let array = [];
    for (let i = 0; i < arg.length; i++) {
        if (i === 0) array.push('Draw');
        else if (i < arg.length / 2) array.push('Win');
        else array.push('Lose')
    }

    const array1 = [arg[0]];
    array1.push(...array);
    const arr = [];
    arr.push(o(thd, array1));
    for (let i = 1; i < arg.length; i++) {
        const no = [arg[i]];
        array.unshift(array.pop());
        no.push(...array);
        arr.push(o(thd, no));
    }
    table(arr);
}

cn(arguments);
