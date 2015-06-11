# seqqu - put everything into sequence

## What is this:
A library to make Promise(ES6+) based sequence

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
// TBD
```