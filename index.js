var Result = (function () {
    function Result(a, cs1) {
        this.a = a;
        this.cs1 = cs1;
    }
    return Result;
})();
var Pair = (function () {
    function Pair(item1, item2) {
        this.item1 = item1;
        this.item2 = item2;
    }
    Pair.create = function (item1, item2) { return new Pair(item1, item2); };
    return Pair;
})();
var unit = function (v) { return function (cs) { return [new Result(v, cs)]; }; };
var bind = exports.bind = function (p, f) { return function (cs) { return [].concat.apply([], p(cs).map(function (res) { return f(res.a)(res.cs1); })); }; };
var result = exports.result = function (v) { return function (cs) { return [new Result(v, cs)]; }; };
var zero = exports.zero = function (cs) { return []; };
var itemm = exports.item = function (cs) {
    if (!cs.length)
        return [];
    return [new Result(cs[0], cs.substr(1))];
};
var seq = exports.seq = function (p, q) { return bind(p, function (x) { return bind(q, function (y) { return unit(Pair.create(x, y)); }); }); };
var sat = exports.sat = function (predicate) { return bind(itemm, function (x) { return predicate(x) && result(x) || zero; }); };
var char = exports.char = function (x) { return sat(function (y) { return y === x; }); };
var digit = exports.digit = sat(function (x) { return x >= '0' && x <= '9'; });
var lower = exports.lower = sat(function (x) { return x >= 'a' && x <= 'z'; });
var upper = exports.upper = sat(function (x) { return x >= 'A' && x <= 'Z'; });
var plus = exports.plus = function (p, q) { return function (cs) { return p(cs).concat(q(cs)); }; };
var letter = exports.letter = plus(lower, upper);
var alphanum = exports.alphanum = plus(letter, digit);
var word = exports.word = plus(bind(letter, function (x) { return bind(word, function (xs) { return result(x + xs); }); }), result(''));
var many = exports.many = function (p) { return plus(bind(p, function (x) { return bind(many(p), function (xs) { return result([x].concat(xs)); }); }), result([])); };
var word2 = exports.word2 = many(letter);
var ident = exports.ident = bind(lower, function (x) { return bind(many(alphanum), function (xs) { return result(x + xs); }); });
var many1 = function (p) { return exports.many1 = bind(p, function (x) { return bind(many(p), function (xs) { return result([x].concat(xs)); }); }); };
var nat = exports.nat = bind(many1(digit), function (xs) { return result(parseFloat(xs)); });
var sepby1 = exports.sepby1 = function (p, sep) { return bind(p, function (x) { return bind(sep, function (_) { return bind(many(p), function (xs) { return result([x].concat(xs)); }); }); }); };
var int = plus(bind(char('-'), function (_) { return bind(nat, function (n) { return result(-n); }); }), nat);
var ints = bind(char('['), function (_) { return bind(sepby1(int, char(',')), function (ns) { return bind(char(']'), function (_) { return result(ns); }); }); });
var bracket = function (open, p, close) { return bind(open, function (_) { return bind(p, function (x) { return bind(close, function (_) { return result(x); }); }); }); };
var intsv2 = bracket(char('['), sepby1(int, char(',')), (char(']')));
var addop = plus(bind(char('+'), function (_) { return result(function (a, b) { return a + b; }); }), bind(char('-'), function (_) { return result(function (a, b) { return a - b; }); }));
var factor = plus(nat, bind(char('('), function (_) { return bind(exprv2, function (x) { return bind(char(')'), function (_) { return result(x); }); }); }));
var expr = exports.expr = bind(factor, function (x) { return bind(many(bind(addop, function (f) { return bind(factor, function (y) { return result(Pair.create(f, y)); }); })), function (fys) { return result(fys.reduce(function (x, p) { return p.item1(x, p.item2); }, x)); }); });
var chainl1 = function (p, op) { return bind(p, function (x) { return bind(many(bind(op, function (f) { return bind(p, function (y) { return result(Pair.create(f, y)); }); })), function (fys) { return result(fys.reduce(function (x, pair) { return pair.item1(x, pair.item2); }, x)); }); }); };
var exprv2 = exports.exprv2 = chainl1(factor, addop);
//# sourceMappingURL=index.js.map