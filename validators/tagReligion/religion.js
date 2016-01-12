module.exports = {
  without_denomination: {
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
  },
  unknown_christian_denomination: {
    feature_type: true,
    match: {
      'christian': true
    },
    nomatch: {
      anglican: true,
      apostolic: true,
      baptist: true,
      catholic: true,
      christian_community: true,
      christian_scientist: true,
      coptic_orthodox: true,
      czechoslovak_hussite: true,
      dutch_reformed: true,
      evangelical: true,
      foursquare: true,
      greek_catholic: true,
      greek_orthodox: true,
      jehovahs_witness: true,
      kabbalah: true,
      karaite: true,
      living_waters_church: true,
      lutheran: true,
      maronite: true,
      mennonite: true,
      methodist: true,
      mormon: true,
      new_apostolic: true,
      nondenominational: true,
      old_catholic: true,
      orthodox: true,
      pentecostal: true,
      presbyterian: true,
      protestant: true,
      quaker: true,
      roman_catholic: true,
      russian_orthodox: true,
      salvation_army: true,
      serbian_orthodox: true,
      seventh_day_adventist: true,
      united: true,
      united_reformed: true,
      uniting: true
    },
    throw: "unknown christian denomination",
    value: function(val) {
      if (this.feature_type && this.match[val.properties.religion]) {
        return !this.nomatch[val.properties.denomination];
      }
    }
  },
  unknown_muslim_denomination: {
    feature_type: true,
    match: {
      'muslim': true
    },
    nomatch: {
      alaouite: true,
      druze: true,
      ibadi: true,
      ismaili: true,
      nondenominational: true,
      shia: true,
      sunni: true
    },
    throw: "unknown muslim denomination",
    value: function(val) {
      if (this.feature_type && this.match[val.properties.religion]) {
        return !this.nomatch[val.properties.denomination];
      }
    }
  },
  unknown_jewish_denomination: {
    feature_type: true,
    match: {
      'jewish': true
    },
    nomatch: {
      alternative: true,
      ashkenazi: true,
      conservative: true,
      hasidic: true,
      humanistic: true,
      liberal: true,
      modern_orthodox: true,
      neo_orthodox: true,
      nondenominational: true,
      orthodox: true,
      progressive: true,
      reconstructionist: true,
      reform: true,
      renewal: true,
      samaritan: true,
      ultra_orthodox: true
    },
    throw: "unknown jewish denomination",
    value: function(val) {
      if (this.feature_type && this.match[val.properties.religion]) {
        return !this.nomatch[val.properties.denomination];
      }
    }
  },
  value: function(val) {
    if (this.without_denomination.value(val)) {
      val.properties.throw = this.without_denomination.throw;
      return true;
    } else if (this.unknown_christian_denomination.value(val)) {
      val.properties.throw = this.unknown_christian_denomination.throw;
      return true;
    } else if (this.unknown_muslim_denomination.value(val)) {
      val.properties.throw = this.unknown_muslim_denomination.throw;
      return true;
    } else if (this.unknown_jewish_denomination.value(val)) {
      val.properties.throw = this.unknown_jewish_denomination.throw;
      return true;
    } else {
      return false;
    }
  }
};