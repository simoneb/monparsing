class Result<A> {
    constructor(public v:A, public cs1:string) {
    }
}

interface IParser<A> {
    (cs:string): Result<A>[];
}

interface Monad<A> {
    unit: (v:A) => Monad<A>;
    bind: <B>(m:Monad<A>) => (f:(v:A) => Monad<B>) => Monad<B>;
}

interface Parser<A> extends IParser<A> {
    bind: <B>(f:(v:A) => Parser<B>) => Parser<B>;
}

function mp<A>(p:IParser<A>):Parser<A> {
    var parser = <Parser<A>>p;
    parser.bind = <B>(f) => mp<B>(cs => [].concat.apply([], p(cs).map(res => f(res.v)(res.cs1))));

    return parser;
}

var unit = v => mp(cs => [new Result(v, cs)]);

var zero = mp(cs => []);
var one = mp(cs => cs.length ? [] : [new Result(cs[0], cs.substr(1))]);

var seq = <a, b>(p:Parser<a>, q:Parser<b>) => p.bind(x => q.bind(y => unit([x, y])));

var sat:<T>(predicate:(v:T) => boolean) => Parser<T> = predicate => one.bind(x => predicate(x) ? unit(x) : zero);

var char = (x:string) => sat<string>(y => y === x);
var digit = sat<string>(x => x >= '0' && x <= '9');
var lower = sat<string>(x => x >= 'a' && x <= 'z');
var upper = sat<string>(x => x >= 'A' && x <= 'Z');

var plus = <A>(p:Parser<A>, q:Parser<A>):Parser<A> => mp(cs => p(cs).concat(q(cs)));
var letter = plus(lower, upper);
var alphanum = plus(letter, digit);

var word:Parser<string> = plus(letter.bind(x => word.bind(xs => unit(x + xs))), unit(''));
var many = <A>(p:Parser<A>):Parser<A[]> => plus(p.bind(x => many(p).bind(xs => unit([x].concat(xs)))), unit([]));
var word2 = many(letter);
var ident = lower.bind(x => many(alphanum).bind(xs => unit(x + xs)));
var many1 = p => p.bind(x => many(p).bind(xs => unit([x].concat(xs))));
var nat:Parser<number> = many1(digit).bind(xs => unit(parseFloat(xs)));
var sepby1 = <a, b>(p:Parser<a>, sep:Parser<b>):Parser<a[]> =>
    p.bind<a[]>(x => sep.bind(_ => many(p).bind(xs => unit([x].concat(xs)))));
var int = plus(char('-').bind(_ => nat.bind(n => unit(-n))), nat);
var ints = char('[').bind(_ => sepby1(int, char(',')).bind(ns => char(']').bind(_ => unit(ns))));
var bracket = (open, p, close) => open.bind(_ => p.bind(x => close.bind(_ => unit(x))));
var intsv2 = bracket(char('['), sepby1(int, char(',')), (char(']')));

var addop = plus(char('+').bind(_ => unit((a, b) => a + b)), char('-').bind(_ => unit((a, b) => a - b)));
var factor = plus(nat, char('(').bind(_ => exprv2.bind(x => char(')').bind(_ => unit(x)))));
var expr:Parser<number> =
    factor.bind(x => many(addop.bind(f => factor.bind(y => unit([f, y])))).bind(fys =>
        unit(fys.reduce((x, p) => p[0](x, p[1]), x))));
var chainl1 = (p, op) =>
    p.bind(x => many(op.bind(f => p.bind(y => unit([f, y]))))
        .bind(fys => unit(fys.reduce((x, pair) => pair[0](x, pair[1]), x))));

var exprv2 = chainl1(factor, addop);