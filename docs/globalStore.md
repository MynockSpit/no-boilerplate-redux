# `globalStore(storePart).set(fnOrValue)`


Examples:

```js
// Given:
store: {
  developers: {
    Jeff: {
      Title: "Software Developer",
      TenureInDays: 840
    },
    Anne: {
      Title: "Sr. Softeware Developer",
      TenureInDays: 1260
    }
  }
}

globalStore('developers')
  .getPath('Jeff.Title')
  .setTo("Web Developer")

// fires action REDUCERLESS_SET_DEVELOPERS
// sets developer.Jeff.Title -> "Web Developer"
```


You can use the `.action` chain, to add details to your action.

```js
globalStore('developers')
  .getPath('Jeff.Title')
  .setAction('title')
  .setTo("Web Developer")

// fires action REDUCERLESS_SET_DEVELOPERS_TITLE
// sets developer.Jeff.Title -> "Web Developer"


```