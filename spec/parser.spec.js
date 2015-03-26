var parse = require('../parser');
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
            expect(parse.zero()('hello').length).toBe(0);
        });
    });
    describe('plus', function () {
        it('should concatenate the results of applying both parsers on the input', function () {
            var result = parse.plus(parse.item, parse.item)('hello');
            expect(result.length).toBe(2);
            expect(result[0]).toEqual(['h', 'ello']);
            expect(result[1]).toEqual(['h', 'ello']);
        });
    });
    describe('pplus', function () {
        it('should return the first result', function () {
            var result = parse.pplus(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual(['h', 'ello']);
        });
    });
    describe('seq', function () {
        it('apply parsers in sequence', function () {
            var result = parse.seq(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['h', 'e'], 'llo']);
        });
    });
    describe('naiveSeq', function () {
        it('should work', function () {
            var result = parse.naiveSeq(parse.item, parse.item)('hello');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['h', 'e'], 'llo']);
        });
    });
    describe('sat', function () {
        it('should parse when condition matches', function () {
            var result = parse.sat(Number)('1A');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual(['1', 'A']);
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
        it('should parse matching string', function () {
            var result = parse.string('hello')('helloWorld');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual(['hello', 'World']);
        });
    });
    describe('many', function () {
        it('should concatenate the results', function () {
            var result = parse.many(parse.char('c'))('ccD');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['c', 'c'], 'D']);
        });
        it('should return empty array when it cannot parse', function () {
            var result = parse.many(parse.char('c'))('D');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([[], 'D']);
        });
    });
    describe('many1', function () {
        it('should concatenate the results', function () {
            var result = parse.many1(parse.char('c'))('ccCC');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['c', 'c'], 'CC']);
        });
        it('should fail when it cannot parse', function () {
            var result = parse.many1(parse.char('c'))('D');
            expect(result.length).toBe(0);
        });
    });
    describe('sepby1', function () {
        it('should parse letters separated by digits', function () {
            var result = parse.sepby1(parse.letter, parse.digit)('a1b2c3');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([['a', 'b', 'c'], '3']);
        });
        it('should fail', function () {
            var result = parse.sepby1(parse.letter, parse.digit)('ab2c');
            expect(result.length).toBe(1);
            expect(result[0][0]).toEqual(['a']);
            expect(result[0][1]).toBe('b2c');
        });
    });
    describe('sepby', function () {
        it('should parse letters separated by digits', function () {
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
        it('should parse digits and sum them up', function () {
            var res = parse.chainl1(parse.digit.bind(function (x) { return parse.unit(parseInt(x)); }), parse.unit(function (a) { return function (b) { return a + b; }; }))('123a');
            expect(res[0]).toEqual([6, 'a']);
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
        it('should parse and evaluate arithmetic expression', function () {
            var result = parse.apply(parse.expr, ' 1 - 2 * (3 - 1) + 2 ');
            expect(result.length).toBe(1);
            expect(result[0]).toEqual([-1, '']);
        });
    });
});
//# sourceMappingURL=parser.spec.js.map