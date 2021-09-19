# PostHTML Bemify plugin
This Posthtml plugin transform custom tags with specific attributes to BEM-like HTML

## Install
```sh
npm i mayoujin/posthtml-bemify#1.0.0 --save-dev
// or
npm i posthtml-bemify@1 --save-dev
```

## Usage

```javascript
// posthtml.config.js
module.exports = {
  plugins: {
    "posthtml-bemify": {
      skipTags: ["svg"],
    },
  }
}
```

## Example

### Blocks

#### Default
```html
<page bem:b>
    <header></header>
    <article></article>
    <footer></footer>
</page>
```

Would be transformed to html:

```html
<div class="page">
    <div class="page__header"></div>
    <div class="page__article"></div>
    <div class="page__footer"></div>
</div>
```

#### Named blocks
```html
<section bem:b="page">
    <header></header>
    <article></article>
    <footer></footer>
</section>
```

Would be transformed to html:

```html
<section class="page">
    <div class="page__header"></div>
    <div class="page__article"></div>
    <div class="page__footer"></div>
</section>
```

#### Multiple names of block
```html
<section bem:b="page|page-main">
    <header></header>
    <article></article>
    <footer></footer>
</section>
```

Would be transformed to html:

```html
<section class="page page-main">
    <div class="page__header page-main__header"></div>
    <div class="page__article page-main__article"></div>
    <div class="page__footer page-main__footer"></div>
</section>
```

#### Nested blocks
```html
<section bem:b="page">
    <article bem:b>
        <text tag="p">Content</textp>
    </article>
</section>
```

Would be transformed to html:

```html
<section class="page">
    <div class="page__article article">
        <p class="article__text">Content</p>
    </div>
</section>
```

### Elements
#### With custom name
```html
<page bem:b>
    <header bem:e="top"></header>
    <article bem:e="content"></article>
    <footer bem:e="bottom"></footer>
</page>
```

Would be transformed to html:

```html
<div class="page">
    <header class="page__top"></header>
    <article class="page__content"></article>
    <footer class="page__bottom"></footer>
</div>
```

#### With selective element name of multiple names block
```html
<section bem:b="page|page-main">
    <header bem:e="top" bem:e:of="page"></header>
    <article bem:e="content" bem:e:of="page-main"></article>
    <footer bem:e="bottom" bem:e:of="page"></footer>
</section>
```

Would be transformed to html:

```html
<div class="page page-main">
    <header class="page__top"></header>
    <article class="page-main__content"></article>
    <footer class="page__bottom"></footer>
</div>
```

### Modifiers

```html
<block bem:b bem:m.bordered.rounded>
    <custom-element bem:m.active></custom-element>
</block>
```

Would be transformed to html:

```html
<div class="block block--bordered block--rounded">
    <div class="block__custom-element block__custom-element--active"></div>
</div>
```

### Tag attr

```html
<submit bem:b tag="button">
    <text tag="span"></text>
</submit>
```

Transformed to:

```html
<button class="submit">
    <span class="submit__text"></span>
</button>
```

### Skip attrs
#### Skip element with children

```html
<block bem:b>
    <h1>Heading</h1>
    <ul bem:skip>
        <li>1</li>
        <li>2</li>
    </ul>
</block>
```

Transformed to:

```html
<div class="block">
    <h1 class="block__h1">Heading</h1>
    <ul>
        <li>1</li>
        <li>2</li>
    </ul>
</div>
```

#### Skip elements children only
```html
<block bem:b>
    <h1>Heading</h1>
    <list tag="ul" bem:skip.children>
        <li>1</li>
        <li>2</li>
    </list>
</block>
```

Transformed to:

```html
<div class="block">
    <h1 class="block__h1">Heading</h1>
    <ul class="block__list">
        <li>1</li>
        <li>2</li>
    </ul>
</div>
```

## Options

```js
{
    /**
    * Default block HTML tag
    * @type {string}
    * @default
    */
    blockTag: 'div',
    
    /**
    * Default element HTML tag
    * @type {string}
    * @default
    */
    elementTag: 'div',
    
    /**
    * Skip HTML tags list
    * @type {string[]}
    * @default
    */
    skipTags: ['b', 'strong', 'i', 'span', 'div', 'section'],

    /**
    * Overrides bem separators
    * @type {{ blockPrefix: string, element: string, modifier: string, modifierValue: string }|false} 
    * @default
    */
    bem: {
        blockPrefix: "",
        element: "__",
        modifier: "--",
        modifierValue: "_"
    },

    /**
     * Overrides bem separators
     * @type { tag: /^[a-z-]{3}$/ }
     * @default
     */
    ignoreTransform: null,
      
    /**
     * Overrides bem separators
     * @type {{ tag: RegExp }|null}
     * @default
     */
    matcher: { tag: /^[a-z-]{3}$/ }

}
```

