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

const MATCHERS = [
  {
    attrs: {
      [SERVICE_ATTRS.BLOCK]: "",
    },
  },
  {
    attrs: {
      [SERVICE_ATTRS.BLOCK]: true,
    },
  },
];

const BEM_SEP = {
  blockPrefix: "",
  element: "__",
  modifier: "--",
  modifierValue: "_",
};

const createBemClassBuilder = ({ bem }) => (block, elem, modName, modVal) => {
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

const createClassBuilder = ({ bem }) => {
  const bemClassBuilder = createBemClassBuilder({ bem });
  return (block, elem, mods, className = bemClassBuilder(block, elem)) =>
    [
      className,
      ...mods.map(([name, value]) => bemClassBuilder(block, elem, name, value)),
    ].join(" ");
};

const DEFAULT_OPTIONS = {
  mode: 'by-attributes',
  blockTag: "div",
  elementTag: "div",
  skipTags: [
    "div", "span", "p", "a", "i", "b", "strong"
  ],
  tagsMap: {},
  classesMap: {},
  bem: BEM_SEP,
  ignoreTransformTag: /^(w|i)/
};

export default (options = DEFAULT_OPTIONS) => {
  options = { ...DEFAULT_OPTIONS, ...options };

  const buildClass = createClassBuilder(options);
  const isWithoutAttributes = options.mode === 'no-attributes';
  const isBem = options.bem != null && typeof options.bem === 'object';

  return (tree) => {
    const process = (node, parent) => {
      const nodeTag = node.tag;
      if (nodeTag === undefined || options.skipTags.includes(nodeTag)) {

        return node;
      }

      if (node.attrs && SERVICE_ATTRS.SKIP in node.attrs) {
        node.attrs[SERVICE_ATTRS.SKIP] = undefined;
        return node;
      }

      const shouldTransformTag = options.ignoreTransformTag.test(nodeTag) === false;

      node = { attrs: {}, ...node };

      if (shouldTransformTag) {
        node.tag =
          node.attrs.tag ||
          options.tagsMap[nodeTag] ||
          TAGS[TAGS.indexOf(nodeTag)];
      }

      const isBlock = SERVICE_ATTRS.BLOCK in node.attrs;

      const mods = Object.entries(node.attrs)
        .filter(([name]) => name.startsWith(SERVICE_ATTRS.MODIFIER))
        .flatMap(([name, value]) => {
          node.attrs[name] = undefined;
          const mods = name.split(".").slice(1);
          if (mods.length) {
            return mods.filter((v) => !!v).map((v) => [v, ""]);
          }

          const modsVals = value.split(".").slice(1);
          if (modsVals.length) {
            return modsVals.filter((v) => !!v).map((v) => [v, ""]);
          }

          return [[value, ""]];
        });

      if (isBem && parent && parent.component) {
        const customElementName = node.attrs[SERVICE_ATTRS.ELEMENT];
        const elemName =
          typeof options.classesMap[nodeTag] === "function"
            ? options.classesMap[nodeTag](parent, options)
            : nodeTag;

        const elementOf = node.attrs[SERVICE_ATTRS.ELEMENT_OF]
          ? node.attrs[SERVICE_ATTRS.ELEMENT_OF].split("|")
          : parent.component.name;

        const blockName = elementOf;

        node.attrs.class = [
          buildClass(
            blockName,
            customElementName || elemName,
            isBlock ? [] : mods
          ),
        ]
          .concat(node.attrs.class || [])
          .join(" ");

        node.tag = node.tag || options.elementTag;

        node.component = {
          name: parent.component.name,
          elem: nodeTag,
          parent,
        };
      }

      if (isBlock || isBem === false) {
        const blockName = (node.attrs[SERVICE_ATTRS.BLOCK] || nodeTag).split(
          "|"
        );

        node.attrs.class = [buildClass(blockName, null, mods)]
          .concat(node.attrs.class || [])
          .join(" ");
        node.tag = node.tag || options.blockTag;

        node.component = {
          name: blockName,
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
        node.content = node.content.map((child) => process(child, node));
      }

      return node;
    };

    const matchers = isWithoutAttributes
      ? { tag: /([A-Z]\w+|([a-z]+-?))/ }
      : MATCHERS;

    tree.match(matchers, process);

    return tree;
  };
};
