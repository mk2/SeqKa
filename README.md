# seqqu - put everything into sequence

[![Build Status](https://travis-ci.org/mk2/seqqu.svg)](https://travis-ci.org/mk2/seqqu)

## What is this:
A library to make Promise(ES6+) based sequential structure (use like javascript array)

## How to use this:

### `seqqu.Map`
```js
// prepare array
var arr = [...];

// make seq from the array
var seq = seqqu.Map(
    arr,
    function(el, resolve, reject) {
        // do anything...
        ...
        // if you got acceptable result, just call the resolve with the result.
        resolve(result);
        // if not, just call the reject.
        reject(err);
    }
);

// let's iterate over the seq with the results!
seq.forEach(function(result, idx, self) {
    ...
});
```

### `seqqu.Seq`
```js
// make arbitrary sequence
var seq = seqqu.Seq(
    0,                 // initial value
    function(v) {
        return v + 1;  // determine next value
    }
);

// let's iterate over the sequence with the results!
seq.reduce(function(carried, result, idx, self) {
    if (idx < 6) {
        return seqqu.fin;
    } else {
        return carried.concat(result);
    }
}, [], function(reduced) {
    assert.equal(reduced, [0, 1, 2, 3, 4, 5], 'Ok, good feeling.');
});
```