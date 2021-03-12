import { toMatchSnapshot } from "./utils";

test("Block should be replaced to `div` tag", () =>
  toMatchSnapshot(`<block bem:b></block>`, `<div class="block"></div>`));

test("Block should be replaced to custom tag", () =>
  toMatchSnapshot(
    `<block bem:b tag="article"></block>`,
    `<article class="block"></article>`
  ));

test("Block should be replaced to `section` tag with mods", () =>
  toMatchSnapshot(
    `<block bem:b bem:m.small.colored></block>`,
    `<div class="block block--small block--colored"></div>`
  ));

test("Nested block should be element of parent block", () =>
  toMatchSnapshot(
    `<block bem:b>
    <other-block bem:b></other-block>
  </block>`,
    `<div class="block">
    <div class="other-block block__other-block"></div>
  </div>`
  ));

test("Block name should be take from bem:b value `ul`", () =>
  toMatchSnapshot(
    `<header bem:b="app-header">
  </header>`,
    `<header class="app-header">
  </header>`
  ));
