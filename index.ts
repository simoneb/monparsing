declare var exports;

class Result<T> {
    constructor(public a:T, public cs1:string) {
    }
}

class Pair<T1, T2> {
    constructor(public item1:T1, public item2:T2) {
    }

    static create = (item1, item2) => new Pair(item1, item2);
}

interface Parser<T> {
    (cs:string): Result<T>[];
}

var unit = <TValue>(a:TValue)  => {
    return (cs:string) => [new Result<TValue>(a, cs)];
};

var bind = exports.bind = <TValue, TOutput>(p:Parser<TValue>, f:(a:TValue) => Parser<TOutput>) => {
    return cs => {
        return Array.prototype.concat.apply([], p(cs).map(res => f(res.a)(res.cs1)));
    };
};

var result = exports.result = v => (cs:string) => [new Result(v, cs)];
var zero:Parser<any> = exports.zero = cs => [];
var itemm = exports.item = (cs:string) => {
    if (!cs.length) return [];
    return [new Result(cs[0], cs.substr(1))];
};


var seq = exports.seq = <TValue, TOutput>(p:Parser<TValue>, q:Parser<TOutput>) => {
    return bind(p, x =>
        bind(q, y =>
            unit(Pair.create(x, y))));
};

var sat = exports.sat = (predicate:(c:string) => boolean) =>
    bind(itemm, x => predicate(x) && result(x) || zero);

var char = exports.char = (x:string) => sat(y => y === x);
var digit = exports.digit = sat(x => x >= '0' && x <= '9');
var lower = exports.lower = sat(x => x >= 'a' && x <= 'z');
var upper = exports.upper = sat(x => x >= 'A' && x <= 'Z');
var plus = exports.plus = <T>(p:Parser<T>, q:Parser<T>):Parser<T> => (cs:string) => p(cs).concat(q(cs));
var letter = exports.letter = plus(lower, upper);
var alphanum = exports.alphanum = plus(letter, digit);
var word:Parser<string> = exports.word =
    plus(bind(letter, x => bind(word, xs => result(x + xs))),
        result(''));