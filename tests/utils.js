import posthtml from "posthtml";
import plugin from "../src";

export const toMatchSnapshot = (input, output, options) => {
  return posthtml()
    .use(plugin(options))
    .process(input)
    .then((result) => {
      return expect(result.html).toEqual(output);
    });
};
