declare var require;
declare var describe;
declare var it;
declare var expect;

var parse = require('../index');

describe('parser', () => {

  describe('item', () => {

    it('should parse the first character', () => {
      var result = parse.item('hello');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual(['h', 'ello']);
    });

    it('should fail with empty string', () => {
      var result = parse.item('');

      expect(result.length).toBe(0);
    });

  });

  describe('zero', () => {

    it('should always fail', () => {
      expect(parse.zero('hello').length).toBe(0);
    });

  });

  describe('plus', () => {

    it('should concatenate the results of applying both parsers on the input', () => {
      var result = parse.plus(parse.item, parse.item)('hello');

      expect(result.length).toBe(2);
      expect(result[0][0]).toBe('h');
      expect(result[1][0]).toBe('h');
      expect(result[0][1]).toBe('ello');
      expect(result[1][1]).toBe('ello');
    });

  });

  describe('pplus', () => {

    it('should return the first result', () => {
      var result = parse.pplus(parse.item, parse.item)('hello');

      expect(result.length).toBe(1);
      expect(result[0][0]).toBe('h');
      expect(result[0][1]).toBe('ello');
    });

  });

  describe('seq', () => {

    it('apply parsers in sequence', () => {
      var result = parse.seq(parse.item, parse.item)('hello');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual([['h', 'e'], 'llo']);
    });

  });

  describe('seqPlain', () => {

    it('should work', () => {
      var result = parse.seqPlain(parse.item, parse.item)('hello');

      expect(result.length).toBe(1);
      expect(result[0]).toEqual([['h', 'e'], 'llo']);
    });

  });

  describe('sat', () => {

    it('should match condition', () => {
      var result = parse.sat(Number)('1');

      expect(result.length).toBe(1);
      expect(result[0][0]).toBe('1');
    });

    it('should fail when not matching', () => {
      var result = parse.sat(Number)('a');

      expect(result.length).toBe(0);
    });

  });

  describe('char', () => {

    it('should match one char', () => {
      var results = parse.char('c')('ciao');

      expect(results.length).toBe(1);
      expect(results[0][0]).toBe('c');
      expect(results[0][1]).toBe('iao');
    });

  });

  describe('string', () => {

    it('should return empty string for empty string', () => {
      var result = parse.string('')('hello');
      expect(result.length).toBe(1);
      expect(result[0][0]).toBe('');
    });

    it('should return whole string for matching string', () => {
      var result = parse.string('hello')('hello');
      expect(result.length).toBe(1);
      expect(result[0][0]).toBe('hello');
      expect(result[0][1]).toBe('');
    });

  });

  describe('many', () => {

    it('should return array of results', () => {
      var result = parse.many(parse.char('c'))('ccD');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['c', 'c']);
      expect(result[0][1]).toBe('D');
    });

    it('should return empty array when failing', () => {
      var result = parse.many(parse.char('c'))('D');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual([]);
      expect(result[0][1]).toBe('D');
    });

  });

  describe('many1', () => {

    it('should return array of results', () => {
      var result = parse.many1(parse.char('c'))('ccD');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['c', 'c']);
      expect(result[0][1]).toBe('D');
    });

    it('should return fail when failing', () => {
      var result = parse.many1(parse.char('c'))('D');

      expect(result.length).toBe(0);
    });

  });

  describe('sepby1', () => {

    it('should succeed', () => {
      var result = parse.sepby1(parse.letter, parse.digit)('a1b2c');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['a', 'b', 'c']);
      expect(result[0][1]).toBe('');
    });

    it('should fail', () => {
      var result = parse.sepby1(parse.letter, parse.digit)('ab2c');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['a']);
      expect(result[0][1]).toBe('b2c');
    });

  });

  describe('sepby', () => {

    it('should succeed', () => {
      var result = parse.sepby(parse.letter, parse.digit)('a1b2c');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['a', 'b', 'c']);
      expect(result[0][1]).toBe('');
    });

    it('should fail', () => {
      var result = parse.sepby(parse.letter, parse.digit)('ab2c');

      expect(result.length).toBe(1);
      expect(result[0][0]).toEqual(['a']);
      expect(result[0][1]).toBe('b2c');
    });

  });

  describe('chainl1', () => {

    it('should work', () => {
      var res = parse.chainl1(parse.digit.bind(x => parse.unit(parseInt(x))), parse.unit(a => b => a + b))('123');
      expect(res[0][0]).toBe(6);
    });

  });

  describe('addop', () => {

    it('should add numbers', () => {
      var result = parse.addop('+')[0][0](1)(2);

      expect(result).toBe(3);
    });

  });

  describe('mulop', () => {

    it('should multiply numbers', () => {
      var result = parse.mulop('*')[0][0](2)(2);

      expect(result).toBe(4);
    });

  });

  describe('factor', () => {

    it('should parse digit', () => {
      expect(parse.factor('1')[0][0]).toBe(1);
    });

    it('should parse parenthesised expression', () => {
      expect(parse.factor('(1)')[0][0]).toBe(1);
    });

  });

  describe('expr', () => {

    it('should work', () => {
      var result = parse.apply(parse.expr, ' 1 - 2 * 3 + 4 ');

      expect(result.length).toBe(1);
      expect(result[0][0]).toBe(-1);
    });

  });

});