module.exports = (seed = 'abcdefgh') => {
    const translations = (function addToObj(seed, collector = {}) {
        return seed.split('').reduce((collector, item, index, array) => {
            const notLast = array.length - index - 1;

            if (notLast) {
                collector[item] = addToObj(array.join('').substring(1), collector[item]);
            } else {
                collector[item] = 'z';
            }

            return collector;

        }, collector);
    })(seed, {});

    const keys = seed.split('').map((item, index) => {
        const suffix = seed.substring(index + 1).split('').join('.');

        return `obj.${seed[index]}${(suffix ? `.${suffix}` : '')}`;
    });

    return {translations, keys};
};
