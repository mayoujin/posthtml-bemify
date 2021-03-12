import { toMatchSnapshot } from "./utils"

test("Elements should be replaced to HTML tags with BEM classes", () =>
  toMatchSnapshot(
    `<block bem:b>
    <element-1></element-1>
    <element-2></element-2>
  </block>`,
    `<div class="block">
    <div class="block__element-1"></div>
    <div class="block__element-2"></div>
  </div>`
  ));

test("Element should be replaced to HTML tag with modifiers", () =>
  toMatchSnapshot(
    `<block bem:b>
    <element-1 bem:m.active></element-1>
  </block>`,
    `<div class="block">
    <div class="block__element-1 block__element-1--active"></div>
  </div>`
  ));

test("Element should be replaced to custom HTML tag with BEM classes", () =>
  toMatchSnapshot(
    `<block bem:b>
    <element-1 tag="h1"></element-1>
  </block>`,
    `<div class="block">
    <h1 class="block__element-1"></h1>
  </div>`
  ));

test("Skip replace element config", () =>
  toMatchSnapshot(
    `<block bem:b>
    <svg></svg>
  </block>`,
    `<div class="block">
    <svg></svg>
  </div>`,
    { skipTags: ["svg"] }
  ));

test("Skip replace element config", () =>
  toMatchSnapshot(
    `<block bem:b>
    <svg bem:e="icon"></svg>
  </block>`,
    `<div class="block">
    <svg class="block__icon"></svg>
  </div>`
  ));

test("Multiple blocks element classes", () =>
  toMatchSnapshot(
    `<block bem:b="block|block-custom">
    <ul bem:e="element"></ul>
  </block>`,
    `<div class="block block-custom">
    <ul class="block__element block-custom__element"></ul>
  </div>`
  ));

test("Selective blocks element classes", () =>
  toMatchSnapshot(
    `<block bem:b="block|block-custom">
    <ul bem:e="element" bem:e:of="block"></ul>
  </block>`,
    `<div class="block block-custom">
    <ul class="block__element"></ul>
  </div>`
  ));
