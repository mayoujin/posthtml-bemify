"use strict";

exports.__esModule = true;
exports["default"] = exports.createClassBuilder = exports.createBemClassBuilder = void 0;

var _htmlTags = _interopRequireDefault(require("html-tags"));

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
var BEM_SEP = {
  blockPrefix: "",
  element: "__",
  modifier: "--",
  modifierValue: "_"
};

var createBemClassBuilder = function createBemClassBuilder(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$bem = _ref.bem,
      bem = _ref$bem === void 0 ? BEM_SEP : _ref$bem;

  return function (block, elem, modName, modVal) {
    elem = block ? elem : null;
    modName = elem || block ? modName : null;
    modVal = modName ? modVal : null;
    return [].concat(block).map(function (_block) {
      return [bem.blockPrefix, _block].concat(elem ? [bem.element, elem] : [], modName ? [bem.modifier, modName] : [], modVal ? [bem.modifierValue, modVal] : []).join("");
    }).join(" ");
  };
};

exports.createBemClassBuilder = createBemClassBuilder;

var createClassBuilder = function createClassBuilder(_temp2) {
  var _ref2 = _temp2 === void 0 ? {} : _temp2,
      _ref2$bem = _ref2.bem,
      bem = _ref2$bem === void 0 ? BEM_SEP : _ref2$bem;

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

exports.createClassBuilder = createClassBuilder;
var DEFAULT_OPTIONS = {
  blockTag: "div",
  elementTag: "div",
  skipTags: ["div", "span", "p", "a", "i", "b", "strong"],
  tagsMap: {},
  classesMap: {},
  bem: BEM_SEP,
  // attrs: SERVICE_ATTRS,
  ignoreTransformTag: null,
  matcher: SERVICE_ATTRS,
  // { tag: /^[a-z-]{3}$/ },
  nodeVisitor: null
};

var _default = function _default(options) {
  if (options === void 0) {
    options = DEFAULT_OPTIONS;
  }

  options = _extends({}, DEFAULT_OPTIONS, options);

  var matcher = _extends({}, SERVICE_ATTRS, options.matcher);

  var buildClass = createClassBuilder(options);
  var nodeVisitor = options.nodeVisitor != null ? options.nodeVisitor : function (node, _ref4) {
    var b = _ref4.b,
        e = _ref4.e,
        m = _ref4.m;
    node.attrs["class"] = [buildClass(b, e, m)].concat(node.attrs["class"] || []).join(" ");
  };
  var isBem = options.bem != null && typeof options.bem === 'object';
  return function (tree) {
    var process = function process(node, parent) {
      var nodeTag = node.tag;

      if (nodeTag === undefined || options.skipTags.includes(nodeTag)) {
        return node;
      }

      if (node.attrs && matcher.SKIP in node.attrs) {
        node.attrs[matcher.SKIP] = undefined;
        return node;
      }

      var ignoreTransformTag = options.ignoreTransformTag != null ? Object.entries(options.ignoreTransformTag).every(function (_ref5) {
        var _node$prop;

        var prop = _ref5[0],
            re = _ref5[1];
        var value = (_node$prop = node[prop]) != null ? _node$prop : node.attrs[prop];
        return re.test(value);
      }) : false;
      node = _extends({
        attrs: {}
      }, node);

      if (ignoreTransformTag === false) {
        node.tag = node.attrs.tag || options.tagsMap[nodeTag] || TAGS[TAGS.indexOf(nodeTag)];
      }

      var isBlock = (matcher.BLOCK in node.attrs);
      var mods = Object.entries(node.attrs).filter(function (_ref6) {
        var name = _ref6[0];
        return name.includes(matcher.MODIFIER);
      }).flatMap(function (_ref7) {
        var name = _ref7[0],
            modValue = _ref7[1];
        node.attrs[name] = undefined;
        var mods = name.split(".").slice(1);

        if (mods.length) {
          return mods.filter(function (v) {
            return !!v;
          }).map(function (v) {
            return [v, ""];
          });
        }

        var modsValues = modValue.split(".").slice(1);

        if (modsValues.length > 0) {
          return modsValues.filter(function (v) {
            return !!v;
          }).map(function (v) {
            return [v, ""];
          });
        }

        return modValue;
      });

      if (isBem && parent && parent.component) {
        var customElementName = node.attrs[matcher.ELEMENT];
        var elemName = typeof options.classesMap[nodeTag] === "function" ? options.classesMap[nodeTag](parent, options) : nodeTag;
        var blockName = node.attrs[matcher.ELEMENT_OF] ? node.attrs[matcher.ELEMENT_OF].split("|") : parent.component.name;
        nodeVisitor(node, {
          b: blockName,
          e: customElementName || elemName,
          m: isBlock ? null : mods.length > 0 ? mods : null
        });
        node.tag = node.tag || options.elementTag;
        node.component = {
          name: parent.component.name,
          elem: nodeTag,
          parent: parent
        };
      }

      if (isBlock || isBem === false || ignoreTransformTag) {
        var _blockName = (node.attrs[matcher.BLOCK] || nodeTag).split("|");

        nodeVisitor(node, {
          b: _blockName,
          e: null,
          m: mods
        });
        node.tag = node.tag || options.blockTag;
        node.component = {
          name: _blockName
        };
      }

      node.tag = node.tag || nodeTag;
      node.attrs.tag = undefined;
      delete node.attrs[matcher.ELEMENT];
      delete node.attrs[matcher.BLOCK];
      delete node.attrs[matcher.ELEMENT_OF];

      if (node.attrs[matcher.SKIP_CHILDREN]) {
        delete node.attrs[matcher.SKIP];
        return node;
      }

      if (node.content) {
        node.content = node.content.map(function (child) {
          return process(child, node);
        });
      }

      return node;
    };

    var matchers = [];

    if (isBem) {
      var _attrs, _attrs2;

      matchers.push({
        attrs: (_attrs = {}, _attrs[matcher.BLOCK] = "", _attrs)
      }, {
        attrs: (_attrs2 = {}, _attrs2[matcher.BLOCK] = true, _attrs2)
      });
    } else {
      matchers.push(matcher.BLOCK);
    }

    tree.match(matchers, process);
    return tree;
  };
};

exports["default"] = _default;