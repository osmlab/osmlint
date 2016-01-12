// *[religion =~ /^(christian|jewish|muslim)$/][!denomination] {
//  throwOther: tr("religion without denomination");
//  assertMatch: "node religion=christian";
//  assertNoMatch: "node religion=christian denomination=catholic";
// assertNoMatch: "node religion=foobar";
// }
module.exports = {
  feature_type: true,
  match: {
    'christian': true,
    'jewish': true,
    'muslim': true
  },
  throw: "religion without denomination",
  value: function(val) {
    if (this.feature_type && this.match[val.properties.religion]) {      
      return !val.properties.denomination;
    }
  }
};