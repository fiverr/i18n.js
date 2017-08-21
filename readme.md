# i18n
Isomorphic translation engine. Mimics Ruby's i18n interface.

[![npm](https://img.shields.io/npm/v/@fiverr/i18n.svg)](https://www.npmjs.com/package/@fiverr/i18n)
[![CircleCI](https://img.shields.io/circleci/project/github/fiverr/i18n-js.svg)](https://circleci.com/gh/fiverr/i18n-js)
[![GitHub issues](https://img.shields.io/github/issues/fiverr/i18n-js.svg)](https://github.com/fiverr/i18n-js/issues)

[![bitHound Overall Score](https://www.bithound.io/github/fiverr/i18n-js/badges/score.svg)](https://www.bithound.io/github/fiverr/i18n-js)
[![bitHound Dependencies](https://www.bithound.io/github/fiverr/i18n-js/badges/dependencies.svg)](https://www.bithound.io/github/fiverr/i18n-js/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/fiverr/i18n-js/badges/devDependencies.svg)](https://www.bithound.io/github/fiverr/i18n-js/master/dependencies/npm)


## [Install fom NPM](https://www.npmjs.com/package/@fiverr/i18n)
```sh
npm i @fiverr/i18n -S
```
## Use
```javascript
const I18n = require('@fiverr/i18n');
const translations = require('./my.translations.object');

const i18n = new I18n({translations});
```

| Option | Type | Description |
| ------ | ---- | ----------- |
| `translations` | Object | Representation of translation structure **Must be JSON compliant** otherwise will be treated like an empty object |
| `missing` | Function | Call this function when a key is missing. Function accepts the key as first argument |
| `$scope` | String | Omittable prefix. see [Scope](#instance-with-a-scope) |

```javascript
const i18n = new I18n({
    translations: {...},
    missing: key => logMissingKeyEvent({key: `missing_translation.${key.replace(/\W/g, '_')}`}),
    $scope: 'my_app.page_name'
});
```

### Add more translations after instantiation
```javascript
i18n.add({yet: {another: {key: 'I\'m here, too!'}}});
Use:
i18n.translate('yet.another.key'); // I'm here, too!
```

## Features

### Interpolate with data
```javascript
const i18n = new I18n({
    translations: {
        my: { string: 'a dynamic %{thing} in a static string' }
    }
});
i18n.translate('my.string', {thing: 'value'}); // a dynamic value in a static string
```

### One/other
```javascript
const i18n = new I18n({
    translations: {
        it_will_take_me_days: {
            one: 'It\'ll take me one day',
            other: 'It\'ll take me %{count} days'
        }
    }
});
i18n.translate('it_will_take_me_days', {count: 1}); // It'll take me one day
i18n.translate('it_will_take_me_days', {count: 3}); // It'll take me 3 days
i18n.translate('it_will_take_me_days', {count: 'a lot of'}); // It'll take me a lot of days
```

### Instance with a scope
Priority:
1. Found result w/o scope
2. Found result with passed in scope (when applicable)
3. Found result with instance set scope (when applicable)

```javascript
// Global scope setup
const i18n = new I18n({
    translations: {
        users: { get: { title: '%{username}\'s page' } }
    },
    $scope: 'users.get'
});
// Use:
i18n.translate('title', {username: 'Arthur'}); // Arthur's page

// Single use scope (passed in with data)
const i18n = new I18n({
    translations: {
        users: { get: { title: '%{username}\'s page' } }
    }
});
// Use:
i18n.translate('title', {username: 'Arthur', $scope: 'users.get'}); // Arthur's page
```
