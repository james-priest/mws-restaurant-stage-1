module.exports = {
    "env": {
        "browser": true,
        // "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    // "extends": "google",
    "globals": {
        "DBHelper": false,
        "google": false
    },
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        // "quotes": 0
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": "off",
        "no-unused-vars": "warn",
        "no-undef": "warn",
        "no-useless-escape": "warn"
    }
};