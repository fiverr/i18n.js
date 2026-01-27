export default (seed = "abcdefgh") => {
  const translations = (function addToObj(
    seedStr: string,
    collector: Record<string, unknown> = {},
  ) {
    return seedStr.split("").reduce((innerCollector, item, index, array) => {
      const notLast = array.length - index - 1;

      if (notLast) {
        innerCollector[item] = addToObj(
          array.join("").substring(1),
          (innerCollector[item] as Record<string, unknown> | undefined) || {},
        );
      } else {
        innerCollector[item] = "z";
      }

      return innerCollector;
    }, collector);
  })(seed, {} as Record<string, unknown>);

  const keys = seed.split("").map((item, index) => {
    const suffix = seed
      .substring(index + 1)
      .split("")
      .join(".");

    return `obj.${seed[index]}${suffix ? `.${suffix}` : ""}`;
  });

  return { translations, keys };
};
