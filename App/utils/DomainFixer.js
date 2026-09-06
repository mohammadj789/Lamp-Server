const DomainFixer = (Schema, ...fields) => {
  Schema.set("toJSON", {
    transform: (_doc, ret) => {
      for (const field of fields) {
        if (ret[field]) {
          ret[field] = `${process.env.DOMAIN}/${ret[field]}`;
        }
      }

      return ret;
    },
  });
};

module.exports = { DomainFixer };
