# break the test into multiple separate files because settings would interfere
# with each other.
./node_modules/mocha/bin/mocha ./test/test.js
./node_modules/mocha/bin/mocha ./test/settings.js
