"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _htmlTags = _interopRequireDefault(require("html-tags"));

var _attrs, _attrs2;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var TAGS = _htmlTags["default"];
var SERVICE_ATTRS = {
  BLOCK: "bem:b",
  ELEMENT: "bem:e",
  ELEMENT_OF: "bem:e:of",
  MODIFIER: "bem:m",
  SKIP: "bem:skip",
  SKIP_CHILDREN: "bem:skip.children"
};
var MATCHERS = [{
  attrs: (_attrs = {}, _attrs[SERVICE_ATTRS.BLOCK] = "", _attrs)
}, {
  attrs: (_attrs2 = {}, _attrs2[SERVICE_ATTRS.BLOCK] = true, _attrs2)
}];
var BEM_SEP = {
  blockPrefix: "",
  element: "__",
  modifier: "--",
  modifierValue: "_"
};

var createBemClassBuilder = function createBemClassBuilder(_ref) {
  var bem = _ref.bem;
  return function (block, elem, modName, modVal) {
    elem = block ? elem : null;
    modName = elem || block ? modName : null;
    modVal = modName ? modVal : null;
    return [].concat(block).map(function (_block) {
      return [bem.blockPrefix, _block].concat(elem ? [bem.element, elem] : [], modName ? [bem.modifier, modName] : [], modVal ? [bem.modifierValue, modVal] : []).join("");
    }).join(" ");
  };
};

var createClassBuilder = function createClassBuilder(_ref2) {
  var bem = _ref2.bem;
  var bemClassBuilder = createBemClassBuilder({
    bem: bem
  });
  return function (block, elem, mods, className) {
    if (className === void 0) {
      className = bemClassBuilder(block, elem);
    }

    return [className].concat(mods.map(function (_ref3) {
      var name = _ref3[0],
          value = _ref3[1];
      return bemClassBuilder(block, elem, name, value);
    })).join(" ");
  };
};

var DEFAULT_OPTIONS = {
  mode: 'by-attributes',
  blockTag: "div",
  elementTag: "div",
  skipTags: ["div", "span", "p", "a", "i", "b", "strong"],
  tagsMap: {},
  classesMap: {},
  bem: BEM_SEP,
  ignoreTransformTag: /^(w|i)/
};

var _default = function _default(options) {
  if (options === void 0) {
    options = DEFAULT_OPTIONS;
  }

  options = _extends({}, DEFAULT_OPTIONS, options);
  var buildClass = createClassBuilder(options);
  var isWithoutAttributes = options.mode === 'no-attributes';
  var isBem = options.bem != null && typeof options.bem === 'object';
  return function (tree) {
    var process = function process(node, parent) {
      var nodeTag = node.tag;

      if (nodeTag === undefined || options.skipTags.includes(nodeTag)) {
        return node;
      }

      if (node.attrs && SERVICE_ATTRS.SKIP in node.attrs) {
        node.attrs[SERVICE_ATTRS.SKIP] = undefined;
        return node;
      }

      var shouldTransformTag = options.ignoreTransformTag.test(nodeTag) === false;
      node = _extends({
        attrs: {}
      }, node);

      if (shouldTransformTag) {
        node.tag = node.attrs.tag || options.tagsMap[nodeTag] || TAGS[TAGS.indexOf(nodeTag)];
      }

      var isBlock = (SERVICE_ATTRS.BLOCK in node.attrs);
      var mods = Object.entries(node.attrs).filter(function (_ref4) {
        var name = _ref4[0];
        return name.startsWith(SERVICE_ATTRS.MODIFIER);
      }).flatMap(function (_ref5) {
        var name = _ref5[0],
            value = _ref5[1];
        node.attrs[name] = undefined;
        var mods = name.split(".").slice(1);

        if (mods.length) {
          return mods.filter(function (v) {
            return !!v;
          }).map(function (v) {
            return [v, ""];
          });
        }

        var modsVals = value.split(".").slice(1);

        if (modsVals.length) {
          return modsVals.filter(function (v) {
            return !!v;
          }).map(function (v) {
            return [v, ""];
          });
        }

        return [[value, ""]];
      });

      if (isBem && parent && parent.component) {
        var customElementName = node.attrs[SERVICE_ATTRS.ELEMENT];
        var elemName = typeof options.classesMap[nodeTag] === "function" ? options.classesMap[nodeTag](parent, options) : nodeTag;
        var elementOf = node.attrs[SERVICE_ATTRS.ELEMENT_OF] ? node.attrs[SERVICE_ATTRS.ELEMENT_OF].split("|") : parent.component.name;
        var blockName = elementOf;
        node.attrs["class"] = [buildClass(blockName, customElementName || elemName, isBlock ? [] : mods)].concat(node.attrs["class"] || []).join(" ");
        node.tag = node.tag || options.elementTag;
        node.component = {
          name: parent.component.name,
          elem: nodeTag,
          parent: parent
        };
      }

      if (isBlock || isBem === false) {
        var _blockName = (node.attrs[SERVICE_ATTRS.BLOCK] || nodeTag).split("|");

        node.attrs["class"] = [buildClass(_blockName, null, mods)].concat(node.attrs["class"] || []).join(" ");
        node.tag = node.tag || options.blockTag;
        node.component = {
          name: _blockName
        };
      }

      node.tag = node.tag || nodeTag;
      node.attrs.tag = undefined;
      delete node.attrs[SERVICE_ATTRS.ELEMENT];
      delete node.attrs[SERVICE_ATTRS.BLOCK];
      delete node.attrs[SERVICE_ATTRS.ELEMENT_OF];

      if (node.attrs[SERVICE_ATTRS.SKIP_CHILDREN]) {
        delete node.attrs[SERVICE_ATTRS.SKIP];
        return node;
      }

      if (node.content) {
        node.content = node.content.map(function (child) {
          return process(child, node);
        });
      }

      return node;
    };

    var matchers = isWithoutAttributes ? {
      tag: /([A-Z]\w+|([a-z]+-?))/
    } : MATCHERS;
    tree.match(matchers, process);
    return tree;
  };
};

exports["default"] = _default;
module.exports = exports.default;
module.exports.default = exports.default;