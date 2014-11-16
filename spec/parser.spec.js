var p = require('./../index');
describe('parser', function () {
    describe('char', function () {
        it('should match one char', function () {
            var results = p.char('c')('ciao');
            expect(results.length).toBe(1);
            expect(results[0].a).toBe('c');
            expect(results[0].cs1).toBe('iao');
        });
    });
    describe('bind', function () {
        describe('twoLower', function () {
            var twoLowers = p.bind(p.lower, function (x) { return p.bind(p.lower, function (y) { return p.result(x + y); }); });
            it('success', function () {
                var result = twoLowers('ciao');
                expect(result[0].a).toBe('ci');
                expect(result[0].cs1).toBe('ao');
            });
            it('fail', function () {
                var result = twoLowers('cIao');
                expect(result.length).toBe(0);
            });
        });
    });
    describe('word', function () {
        it('shoud work', function () {
            console.log(p.word('Yes!'));
        });
    });
});
//# sourceMappingURL=parser.spec.js.map