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

var unit = <a>(v:a) => (cs:string) => [new Result<a>(v, cs)];

var bind = exports.bind = <a, b>(p:Parser<a>, f:(v:a) => Parser<b>):Parser<b> =>
        cs => [].concat.apply([], p(cs).map(res => f(res.a)(res.cs1)));

var result = exports.result = v => (cs:string) => [new Result(v, cs)];
var zero:Parser<any> = exports.zero = cs => [];
var itemm = exports.item = (cs:string) => {
    if (!cs.length) return [];
    return [new Result(cs[0], cs.substr(1))];
};

var seq = exports.seq = <a, b>(p:Parser<a>, q:Parser<b>) =>
    bind(p, x =>
        bind(q, y =>
            unit(Pair.create(x, y))));

var sat = exports.sat = (predicate:(c:string) => boolean) =>
    bind(itemm, x => predicate(x) && result(x) || zero);

var char = exports.char = (x:string) => sat(y => y === x);
var digit = exports.digit = sat(x => x >= '0' && x <= '9');
var lower = exports.lower = sat(x => x >= 'a' && x <= 'z');
var upper = exports.upper = sat(x => x >= 'A' && x <= 'Z');
var plus = exports.plus = <a>(p:Parser<a>, q:Parser<a>):Parser<a> => (cs:string) => p(cs).concat(q(cs));
var letter = exports.letter = plus(lower, upper);
var alphanum = exports.alphanum = plus(letter, digit);
var word:Parser<string> = exports.word = plus(bind(letter, x => bind(word, xs => result(x + xs))), result(''));
var many = exports.many = <a>(p:Parser<a>):Parser<a[]> =>
    plus(bind(p, x => bind(many(p), xs => result([x].concat(xs)))), result([]));
var word2 = exports.word2 = many(letter);
var ident = exports.ident = bind(lower, x => bind(many(alphanum), xs => result(x + xs)));
var many1 = p => exports.many1 = bind(p, x => bind(many(p), xs => result([x].concat(xs))));
var nat:Parser<Number> = exports.nat = bind(many1(digit), xs => result(parseFloat(xs)));
var sepby1 = exports.sepby1 = <a, b>(p:Parser<a>, sep:Parser<b>):Parser<a[]> =>
    bind(p, x => bind(sep, _ => bind(many(p), xs => result([x].concat(xs)))));
var int = plus(bind(char('-'), _ => bind(nat, n => result(-n))), nat);
var ints = bind(char('['), _ => bind(sepby1(int, char(',')), ns => bind(char(']'), _ => result(ns))));
var bracket = (open, p, close) => bind(open, _ => bind(p, x => bind(close, _ => result(x))));
var intsv2 = bracket(char('['), sepby1(int, char(',')), (char(']')));

var addop = plus(bind(char('+'), _ => result((a,b) => a + b)), bind(char('-'), _ => result((a,b) => a - b)));
var factor = plus(nat, bind(char('('), _ => bind(exprv2, x => bind(char(')'), _ => result(x)))));
var expr:Parser<Number> = exports.expr =
    bind(factor, x => bind(many(bind(addop, f => bind(factor, y => result(Pair.create(f, y))))), fys =>
    result(fys.reduce((x, p) => p.item1(x, p.item2), x))));
var chainl1 = (p, op) =>
    bind(p, x => bind(many(bind(op, f => bind(p, y => result(Pair.create(f, y))))),
            fys => result(fys.reduce((x, pair) => pair.item1(x, pair.item2), x))));

var exprv2 = exports.exprv2 = chainl1(factor, addop);