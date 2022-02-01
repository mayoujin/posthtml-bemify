import htmlTags from "html-tags";

const TAGS = htmlTags;

const SERVICE_ATTRS = {
  BLOCK: "bem:b",
  ELEMENT: "bem:e",
  ELEMENT_OF: "bem:e:of",
  MODIFIER: "bem:m",
  SKIP: "bem:skip",
  SKIP_CHILDREN: "bem:skip.children",
};

const BEM_SEP = {
  blockPrefix: "",
  element: "__",
  modifier: "--",
  modifierValue: "_",
};

export const createBemClassBuilder = ({ bem = BEM_SEP } = {}) => (block, elem, modName, modVal) => {
  elem = block ? elem : null;
  modName = elem || block ? modName : null;
  modVal = modName ? modVal : null;
  return []
    .concat(block)
    .map((_block) => {
      return [
        bem.blockPrefix,
        _block,
        ...(elem ? [bem.element, elem] : []),
        ...(modName ? [bem.modifier, modName] : []),
        ...(modVal ? [bem.modifierValue, modVal] : []),
      ].join("");
    })
    .join(" ");
};

export const createClassBuilder = ({ bem = BEM_SEP } = {}) => {
  const bemClassBuilder = createBemClassBuilder({ bem });
  return (block, elem, mods, className = bemClassBuilder(block, elem)) =>
    [
      className,
      ...mods.map(([name, value]) => bemClassBuilder(block, elem, name, value)),
    ].join(" ");
};

const DEFAULT_OPTIONS = {
  blockTag: "div",
  elementTag: "div",
  skipTags: [
    "div", "span", "p", "a", "i", "b", "strong"
  ],
  tagsMap: {},
  classesMap: {},
  bem: BEM_SEP,
  // attrs: SERVICE_ATTRS,
  ignoreTransformTag: null,
  matcher: SERVICE_ATTRS, // { tag: /^[a-z-]{3}$/ },
  nodeVisitor: null
};

export default (options = DEFAULT_OPTIONS) => {
  options = { ...DEFAULT_OPTIONS, ...options };

  const matcher = {
    ...SERVICE_ATTRS,
    ...options.matcher
  };
  const buildClass = createClassBuilder(options);

  const nodeVisitor = options.nodeVisitor != null
    ? options.nodeVisitor
    : (node, { b, e, m }) => {
      node.attrs["class"] = [buildClass(b, e, m)].concat(node.attrs["class"] || []).join(" ");
    };

  const isBem = options.bem != null && typeof options.bem === 'object';

  return (tree) => {
    const process = (node, parent) => {
      const nodeTag = node.tag;
      if (nodeTag === undefined || options.skipTags.includes(nodeTag)) {

        return node;
      }

      if (node.attrs && matcher.SKIP in node.attrs) {
        node.attrs[matcher.SKIP] = undefined;
        return node;
      }

      const ignoreTransformTag = options.ignoreTransformTag != null
        ? Object.entries(options.ignoreTransformTag).every(([ prop, re ]) => {
          const value = node[prop] ?? node.attrs[prop];
          return re.test(value);
        })
        : false;

      node = { attrs: {}, ...node };

      if (ignoreTransformTag === false) {
        node.tag =
          node.attrs.tag ||
          options.tagsMap[nodeTag] ||
          TAGS[TAGS.indexOf(nodeTag)];
      }

      const isBlock = matcher.BLOCK in node.attrs;

      const mods = Object.entries(node.attrs)
        .filter(([name]) => name.includes(matcher.MODIFIER))
        .flatMap(([name, modValue]) => {
          node.attrs[name] = undefined;
          const mods = name.split(".").slice(1);
          if (mods.length) {
            return mods.filter((v) => !!v).map((v) => [v, ""]);
          }

          const modsValues = modValue.split(".").slice(1);
          if (modsValues.length > 0) {
            return modsValues.filter((v) => !!v).map((v) => [v, ""]);
          }

          return modValue;
        });

      if (isBem && parent && parent.component) {
        const customElementName = node.attrs[matcher.ELEMENT];
        const elemName =
          typeof options.classesMap[nodeTag] === "function"
            ? options.classesMap[nodeTag](parent, options)
            : nodeTag;

        const blockName = node.attrs[matcher.ELEMENT_OF]
          ? node.attrs[matcher.ELEMENT_OF].split("|")
          : parent.component.name;

        nodeVisitor(node, {
          b: blockName,
          e: customElementName || elemName,
          m: isBlock
            ? null
            : mods.length > 0 ? mods : null
        });

        node.tag = node.tag || options.elementTag;

        node.component = {
          name: parent.component.name,
          elem: nodeTag,
          parent,
        };
      }

      if (isBlock || isBem === false || ignoreTransformTag) {
        const blockName = (node.attrs[matcher.BLOCK] || nodeTag).split(
          "|"
        );

        nodeVisitor(node, {
          b: blockName,
          e: null,
          m: mods
        });

        node.tag = node.tag || options.blockTag;

        node.component = {
          name: blockName,
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
        node.content = node.content.map((child) => process(child, node));
      }

      return node;
    };

    const matchers = [];

    if (isBem) {
      matchers.push(
        { attrs: { [matcher.BLOCK]: "" } },
        { attrs: { [matcher.BLOCK]: true } }
      );
    } else {
      matchers.push(matcher.BLOCK);
    }

    tree.match(matchers, process);

    return tree;
  };
};
