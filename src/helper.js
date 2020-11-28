const qs = require('qs');

exports.getUserName = (queryString) => qs.parse(queryString, { ignoreQueryPrefix: true });
