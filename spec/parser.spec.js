var parse = require('../index');
describe('parser', function () {
    describe('item', function () {
        it('should parse the first character', function () {
            var result = parse.item('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual(['h', 'ello']);
        });
        it('should fail with empty string', function () {
            var result = parse.item('');
            expect(result.length).toBe(0);
        });
    });
    describe('zero', function () {
        it('should always fail', function () {
            expect(parse.zero('hello').length).toBe(0);
        });
    });
    describe('plus', function () {
        it('should concatenate the results of applying both parsers on the input', function () {
            var result = parse.plus(parse.item, parse.item)('hello');
            expect(result.length).toBe(2);
            expect(result[0][0]).toBe('h');
            expect(result[1][0]).toBe('h');
            expect(result[0][1]).toBe('ello');
            expect(result[1][1]).toBe('ello');
        });
    });
    describe('pplus', function () {
        it('should return the first result', function () {
            var result = parse.pplus(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0][0]).toBe('h');
            expect(result[0][1]).toBe('ello');
        });
    });
    describe('seq', function () {
        it('apply parsers in sequence', function () {
            var result = parse.seq(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['h', 'e'], 'llo']);
        });
    });
    describe('seqPlain', function () {
        it('should work', function () {
            var result = parse.seqPlain(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['h', 'e'], 'llo']);
        });
    });
    describe('sat', function () {
        it('should match condition', function () {
            var result = parse.sat(Number)('1');
            expect(result.length).toBe(1);
            expect(result[0][0]).toBe('1');
        });
        it('should fail when not matching', function () {
            var result = parse.sat(Number)('a');
            expect(result.length).toBe(0);
        });
    });
    describe('char', function () {
        it('should match one char', function () {
            var results = parse.char('c')('ciao');
            expect(results.length).toBe(1);
            expect(results[0][0]).toBe('c');
            expect(results[0][1]).toBe('iao');
        });
    });
    describe('string', function () {
        it('should return empty string for empty string', function () {
            var result = parse.string('')('hello');
            expect(result.length).toBe(1);
            expect(result[0][0]).toBe('');
        });
        it('should return whole string for matching string', function () {
            var result = parse.string('hello')('hello');
            expect(result.length).toBe(1);
            expect(result[0][0]).toBe('hello');
            expect(result[0][1]).toBe('');
        });
    });
    describe('many', function () {
        it('should return array of results', function () {
            var result = parse.many(parse.char('c'))('ccD');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['c', 'c']);
            expect(result[0][1]).toBe('D');
        });
        it('should return empty array when failing', function () {
            var result = parse.many(parse.char('c'))('D');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual([]);
            expect(result[0][1]).toBe('D');
        });
    });
    describe('many1', function () {
        it('should return array of results', function () {
            var result = parse.many1(parse.char('c'))('ccD');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['c', 'c']);
            expect(result[0][1]).toBe('D');
        });
        it('should return fail when failing', function () {
            var result = parse.many1(parse.char('c'))('D');
            expect(result.length).toBe(0);
        });
    });
    describe('sepby1', function () {
        it('should succeed', function () {
            var result = parse.sepby1(parse.letter, parse.digit)('a1b2c');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['a', 'b', 'c']);
            expect(result[0][1]).toBe('');
        });
        it('should fail', function () {
            var result = parse.sepby1(parse.letter, parse.digit)('ab2c');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['a']);
            expect(result[0][1]).toBe('b2c');
        });
    });
    describe('sepby', function () {
        it('should succeed', function () {
            var result = parse.sepby(parse.letter, parse.digit)('a1b2c');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['a', 'b', 'c']);
            expect(result[0][1]).toBe('');
        });
        it('should fail', function () {
            var result = parse.sepby(parse.letter, parse.digit)('ab2c');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['a']);
            expect(result[0][1]).toBe('b2c');
        });
    });
    describe('chainl1', function () {
        it('should work', function () {
            var res = parse.chainl1(parse.digit.bind(function (x) { return parse.unit(parseInt(x)); }), parse.unit(function (a) { return function (b) { return a + b; }; }))('123');
            expect(res[0][0]).toBe(6);
        });
    });
    describe('addop', function () {
        it('should add numbers', function () {
            var result = parse.addop('+')[0][0](1)(2);
            expect(result).toBe(3);
        });
    });
    describe('mulop', function () {
        it('should multiply numbers', function () {
            var result = parse.mulop('*')[0][0](2)(2);
            expect(result).toBe(4);
        });
    });
    describe('factor', function () {
        it('should parse digit', function () {
            expect(parse.factor('1')[0][0]).toBe(1);
        });
        it('should parse parenthesised expression', function () {
            expect(parse.factor('(1)')[0][0]).toBe(1);
        });
    });
    describe('expr', function () {
        it('should work', function () {
            var result = parse.apply(parse.expr, ' 1 - 2 * 3 + 4 ');
            expect(result.length).toBe(1);
            expect(result[0][0]).toBe(-1);
        });
    });
});
//# sourceMappingURL=parser.spec.js.map