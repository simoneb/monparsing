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
var unit = function (a) {
    return function (cs) { return [new Result(a, cs)]; };
};
var bind = exports.bind = function (p, f) {
    return function (cs) {
        return Array.prototype.concat.apply([], p(cs).map(function (res) { return f(res.a)(res.cs1); }));
    };
};
var result = exports.result = function (v) { return function (cs) { return [new Result(v, cs)]; }; };
var zero = exports.zero = function (cs) { return []; };
var itemm = exports.item = function (cs) {
    if (!cs.length)
        return [];
    return [new Result(cs[0], cs.substr(1))];
};
var seq = exports.seq = function (p, q) {
    return bind(p, function (x) { return bind(q, function (y) { return unit(Pair.create(x, y)); }); });
};
var sat = exports.sat = function (predicate) { return bind(itemm, function (x) { return predicate(x) && result(x) || zero; }); };
var char = exports.char = function (x) { return sat(function (y) { return y === x; }); };
var digit = exports.digit = sat(function (x) { return x >= '0' && x <= '9'; });
var lower = exports.lower = sat(function (x) { return x >= 'a' && x <= 'z'; });
var upper = exports.upper = sat(function (x) { return x >= 'A' && x <= 'Z'; });
var plus = exports.plus = function (p, q) { return function (cs) { return p(cs).concat(q(cs)); }; };
var letter = exports.letter = plus(lower, upper);
var alphanum = exports.alphanum = plus(letter, digit);
var word = exports.word = plus(bind(letter, function (x) { return bind(word, function (xs) { return result(x + xs); }); }), result(''));
//# sourceMappingURL=index.js.map