exports.mp = function (p) {
    var parser = p;
    parser.bind = function (f) { return exports.mp(function (cs) { return [].concat.apply([], p(cs).map(function (res) { return f(res[0])(res[1]); })); }); };
    return parser;
};
exports.item = exports.mp(function (cs) { return cs.length ? [[cs[0], cs.substr(1)]] : []; });
exports.unit = function (v) { return exports.mp(function (cs) { return [[v, cs]]; }); };
exports.zero = exports.mp(function (cs) { return []; });
exports.plus = function (p, q) { return exports.mp(function (cs) { return p(cs).concat(q(cs)); }); };
exports.pplus = function (p, q) { return exports.mp(function (cs) {
    var res = exports.plus(p, q)(cs);
    return res.length ? [res[0]] : [];
}); };
exports.sat = function (pred) { return exports.item.bind(function (x) { return pred(x) ? exports.unit(x) : exports.zero; }); };
exports.char = function (x) { return exports.sat(function (y) { return y === x; }); };
exports.string = function (x) { return x.length ? exports.char(x[0]).bind(function (c) { return exports.string(x.substr(1)).bind(function (cs) { return exports.unit(c + cs); }); }) : exports.unit(''); };
exports.seq = function (p, q) { return p.bind(function (x) { return q.bind(function (y) { return exports.unit([x, y]); }); }); };
exports.seqPlain = function (p, q) { return exports.mp(function (cs) {
    var pRes = p(cs);
    var qRes = q(pRes[0][1]);
    var res = [pRes[0][0], qRes[0][0]];
    return [[res, qRes[0][1]]];
}); };
exports.digit = exports.sat(function (x) { return x >= '0' && x <= '9'; });
exports.lower = exports.sat(function (x) { return x >= 'a' && x <= 'z'; });
exports.upper = exports.sat(function (x) { return x >= 'A' && x <= 'Z'; });
exports.letter = exports.plus(exports.lower, exports.upper);
exports.alphanum = exports.plus(exports.letter, exports.digit);
exports.word = exports.plus(exports.letter.bind(function (x) { return exports.word.bind(function (xs) { return exports.unit(x + xs); }); }), exports.unit(''));
exports.many1 = function (p) { return p.bind(function (x) { return exports.many(p).bind(function (xs) { return exports.unit([x].concat(xs)); }); }); };
exports.many = function (p) { return exports.pplus(exports.many1(p), exports.unit([])); };
exports.ident = exports.lower.bind(function (x) { return exports.many(exports.alphanum).bind(function (xs) { return exports.unit(x + xs); }); });
exports.nat = exports.many1(exports.digit).bind(function (xs) { return exports.unit(parseFloat(xs.join(''))); });
exports.sepby1 = function (p, sep) { return p.bind(function (x) { return exports.many(sep.bind(function (_) { return p; })).bind(function (xs) { return exports.unit([x].concat(xs)); }); }); };
exports.sepby = function (p, sep) { return exports.pplus(exports.sepby1(p, sep), exports.unit([])); };
/*

export var chainl1 = <A>(p:Parser<A>, op:Parser<(a:A) => (b:A) => A>):Parser<A> =>
  p.bind(x => many(op.bind(f => p.bind(y => unit([f, y]))))
    .bind(fys => unit(fys.reduce((x, pair) => pair[0](x)(pair[1]), x))));
*/
exports.chainl1 = function (p, op) {
    var rest = function (x) { return exports.pplus(op.bind(function (f) { return p.bind(function (y) { return rest(f(x)(y)); }); }), exports.unit(x)); };
    return p.bind(rest);
};
exports.chainl = function (p, op, a) { return exports.pplus(exports.chainl1(p, op), exports.unit(a)); };
exports.int = exports.plus(exports.char('-').bind(function (_) { return exports.nat.bind(function (n) { return exports.unit(-n); }); }), exports.nat);
exports.ints = exports.char('[').bind(function (_) { return exports.sepby1(exports.int, exports.char(',')).bind(function (ns) { return exports.char(']').bind(function (_) { return exports.unit(ns); }); }); });
exports.bracket = function (open, p, close) { return open.bind(function (_) { return p.bind(function (x) { return close.bind(function (_) { return exports.unit(x); }); }); }); };
exports.intsv2 = exports.bracket(exports.char('['), exports.sepby1(exports.int, exports.char(',')), (exports.char(']')));
exports.space = exports.many(exports.sat(function (x) { return x == ' '; }));
exports.token = function (p) { return p.bind(function (a) { return exports.space.bind(function (_) { return exports.unit(a); }); }); };
exports.symb = function (cs) { return exports.token(exports.string(cs)); };
exports.apply = function (p, cs) { return exports.space.bind(function (_) { return p; })(cs); };
exports.expr;
exports.addop;
exports.mulop;
exports.addop = exports.pplus(exports.symb('+').bind(function (_) { return exports.unit(function (a) { return function (b) { return a + b; }; }); }), exports.symb('-').bind(function (_) { return exports.unit(function (a) { return function (b) { return a - b; }; }); }));
exports.mulop = exports.pplus(exports.symb('*').bind(function (_) { return exports.unit(function (a) { return function (b) { return a * b; }; }); }), exports.symb('/').bind(function (_) { return exports.unit(function (a) { return function (b) { return a / b; }; }); }));
exports.numericDigit = exports.token(exports.digit).bind(function (x) { return exports.unit(parseInt(x)); });
exports.factor = exports.pplus(exports.numericDigit, exports.symb('(').bind(function (_) { return exports.expr.bind(function (n) { return exports.symb(')').bind(function (_) { return exports.unit(n); }); }); }));
exports.term = exports.chainl1(exports.factor, exports.mulop);
exports.expr = exports.chainl1(exports.term, exports.addop);
//# sourceMappingURL=index.js.map