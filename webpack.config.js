const createConfig = require('anux-package/configs/webpack');

const a = createConfig({
    title: "Anux - React - Editor",
    cleanOutputPath: true,
});

console.log(a);

module.exports = a;
