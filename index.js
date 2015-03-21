var Result = (function () {
    function Result(v, cs1) {
        this.v = v;
        this.cs1 = cs1;
    }
    return Result;
})();
function mp(p) {
    var parser = p;
    parser.bind = function (f) { return mp(function (cs) { return [].concat.apply([], p(cs).map(function (res) { return f(res.v)(res.cs1); })); }); };
    return parser;
}
var unit = function (v) { return mp(function (cs) { return [new Result(v, cs)]; }); };
var zero = mp(function (cs) { return []; });
var one = mp(function (cs) { return cs.length ? [] : [new Result(cs[0], cs.substr(1))]; });
var seq = function (p, q) { return p.bind(function (x) { return q.bind(function (y) { return unit([x, y]); }); }); };
var sat = function (predicate) { return one.bind(function (x) { return predicate(x) ? unit(x) : zero; }); };
var char = function (x) { return sat(function (y) { return y === x; }); };
var digit = sat(function (x) { return x >= '0' && x <= '9'; });
var lower = sat(function (x) { return x >= 'a' && x <= 'z'; });
var upper = sat(function (x) { return x >= 'A' && x <= 'Z'; });
var plus = function (p, q) { return mp(function (cs) { return p(cs).concat(q(cs)); }); };
var letter = plus(lower, upper);
var alphanum = plus(letter, digit);
var word = plus(letter.bind(function (x) { return word.bind(function (xs) { return unit(x + xs); }); }), unit(''));
var many = function (p) { return plus(p.bind(function (x) { return many(p).bind(function (xs) { return unit([x].concat(xs)); }); }), unit([])); };
var word2 = many(letter);
var ident = lower.bind(function (x) { return many(alphanum).bind(function (xs) { return unit(x + xs); }); });
var many1 = function (p) { return p.bind(function (x) { return many(p).bind(function (xs) { return unit([x].concat(xs)); }); }); };
var nat = many1(digit).bind(function (xs) { return unit(parseFloat(xs)); });
var sepby1 = function (p, sep) { return p.bind(function (x) { return sep.bind(function (_) { return many(p).bind(function (xs) { return unit([x].concat(xs)); }); }); }); };
var int = plus(char('-').bind(function (_) { return nat.bind(function (n) { return unit(-n); }); }), nat);
var ints = char('[').bind(function (_) { return sepby1(int, char(',')).bind(function (ns) { return char(']').bind(function (_) { return unit(ns); }); }); });
var bracket = function (open, p, close) { return open.bind(function (_) { return p.bind(function (x) { return close.bind(function (_) { return unit(x); }); }); }); };
var intsv2 = bracket(char('['), sepby1(int, char(',')), (char(']')));
var addop = plus(char('+').bind(function (_) { return unit(function (a, b) { return a + b; }); }), char('-').bind(function (_) { return unit(function (a, b) { return a - b; }); }));
var factor = plus(nat, char('(').bind(function (_) { return exprv2.bind(function (x) { return char(')').bind(function (_) { return unit(x); }); }); }));
var expr = factor.bind(function (x) { return many(addop.bind(function (f) { return factor.bind(function (y) { return unit([f, y]); }); })).bind(function (fys) { return unit(fys.reduce(function (x, p) { return p[0](x, p[1]); }, x)); }); });
var chainl1 = function (p, op) { return p.bind(function (x) { return many(op.bind(function (f) { return p.bind(function (y) { return unit([f, y]); }); })).bind(function (fys) { return unit(fys.reduce(function (x, pair) { return pair[0](x, pair[1]); }, x)); }); }); };
var exprv2 = chainl1(factor, addop);
//# sourceMappingURL=index.js.map