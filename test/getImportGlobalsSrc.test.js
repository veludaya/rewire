var expect = require("expect.js"),
    vm = require("vm"),
    getImportGlobalsSrc = require("../lib/getImportGlobalsSrc.js");

describe("getImportGlobalsSrc", function () {
    it("should declare all globals with a var", function () {
        var context = {
                global: global
            },
            expectedGlobals,
            src,
            actualGlobals;

        // Temporarily set module-internal variables on the global scope to check if getImportGlobalsSrc()
        // ignores them properly
        global.module = module;
        global.exports = exports;
        global.require = require;

        src = getImportGlobalsSrc();

        delete global.module;
        delete global.exports;
        delete global.require;

        expectedGlobals = Object.keys(global);

        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context).filter(function (key) {
            // node v0.10 does not set a constructor property on the context
            // node v0.11 does set a constructor property
            // so just lets filter it, because it doesn't make sense to mock it anyway
            return key !== "constructor";
        });
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
        expect(actualGlobals.length).to.be.above(1);
    });
    it("should ignore the given variables", function () {
        var context = {
                global: global
            },
            ignore = ["console", "setTimeout"],
            src,
            actualGlobals,
            expectedGlobals = Object.keys(global);

        // getImportGlobalsSrc modifies the ignore array, so let's create a copy
        src = getImportGlobalsSrc(ignore.slice(0));
        expectedGlobals = expectedGlobals.filter(function filterIgnoredVars(value) {
            return ignore.indexOf(value) === -1;
        });
        vm.runInNewContext(src, context);
        actualGlobals = Object.keys(context).filter(function (key) {
            // node v0.10 does not set a constructor property on the context
            // node v0.11 does set a constructor property
            // so just lets filter it, because it doesn't make sense to mock it anyway
            return key !== "constructor";
        });
        actualGlobals.sort();
        expectedGlobals.sort();
        expect(actualGlobals).to.eql(expectedGlobals);
        expect(actualGlobals.length).to.be.above(1);
    });
});