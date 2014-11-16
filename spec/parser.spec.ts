declare function require(name:string);
declare function describe(name, callback);
declare function it(name, callback);
declare function expect(value);

var p = require('./../index');

describe('parser', () => {

    describe('char', () => {

        it('should match one char', () => {
            var results = p.char('c')('ciao');

            expect(results.length).toBe(1);
            expect(results[0].a).toBe('c');
            expect(results[0].cs1).toBe('iao');
        });

    });

    describe('bind', () => {

        describe('twoLower', () => {
            var twoLowers =
                p.bind(p.lower, x =>
                    p.bind(p.lower, y =>
                        p.result(x + y)));

            it('success', () => {
                var result = twoLowers('ciao');

                expect(result[0].a).toBe('ci');
                expect(result[0].cs1).toBe('ao');
            });

            it('fail', () => {
                var result = twoLowers('cIao');

                expect(result.length).toBe(0);
            });
        });

    });

    describe('word', () => {

        it('shoud work', () => {
            console.log(p.word('Yes!'));
        });

    });

});