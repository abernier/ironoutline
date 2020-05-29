require("luxon")
const { RRule, RRuleSet, rrulestr } = require("rrule")

function utc(d) {
  //
  // Convert a str '2020-06-02' to an UTC date
  //

  const arr = d.split('-')
  arr[1]--;
  
  return Date.UTC(...arr)
}

// List of RRule's days abbrs: ["MO", "Tu", ...]
const RRuleWeekdays = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU].map(el => el.toString());

const conf = {
  ft: {
    weeks: 9,
    unit: 1, // day is the unit
    weekdaysValues: {
      [RRule.MO]: 1,
      [RRule.TU]: 1,
      [RRule.WE]: 1,
      [RRule.TH]: 1,
      [RRule.FR]: 1
    }
  },
  pt: {
    weeks: 24,
    unit: .5, // halfday is the unit
    weekdaysValues: {
      [RRule.TU]: 1,
      [RRule.TH]: 1,
      [RRule.SA]: 2 // a saturday counts for 2 halfdays (unit)
    }
  }
}

module.exports = function (ftpt='ft', start=Date.now(), hollidays=[]) {
  const dtstart = new Date(utc(start))

  const weeks = conf[ftpt].weeks
  const unit = conf[ftpt].unit
  const weekdaysValues = conf[ftpt].weekdaysValues
  const unitsPerWeek = Object.values(weekdaysValues).reduce((acc, curr) => acc + curr) // 5 for FT / 4 for PT

  //
  // 1. Constitute a set of reccuring dates
  //

  const rrules = []

  const TOTAL = 600 // We want a quite big amount of dates (to have enough for 2.)

  const weekdays = Object.keys(weekdaysValues)
  weekdays.forEach(weekday => {
    const weekdayValue = weekdaysValues[weekday]

    // Trick: it will add X entries of this day: for ex, will add 2 Sa
    rrules.push(new RRule({
      interval: 24/weekdayValue, // every 1
      freq: RRule.HOURLY, // week
      byweekday: weekday, // on: Tu, Th, Sa
      dtstart, // starting from
      count: TOTAL/weekdays.length
    }))
  })

  // Add all the rrules to the rruleSet
  const rruleSet = new RRuleSet(true)
  rrules.forEach(rrule => {
    rrule.all().forEach(dt => rruleSet.rdate(dt))
  })
  // console.log(rruleSet.all())

  //
  // Exclude hollidays dates
  //

  const exrules = []
  hollidays.forEach(str => {
    const d = new Date(utc(str))

    const weekday = RRuleWeekdays[d.getDay()-1]
    const weekdayValue = weekdaysValues[weekday]

    if (weekdayValue) { // if this holli-day is a working day => remove it
      exrules.push(new RRule({
        freq: RRule.HOURLY,
        interval: 24/weekdayValue, // 12
        count: weekdayValue, // 2
        dtstart: d
      }))
    }
    
  })

  // Remove all the rrules to the rruleSet
  exrules.forEach(exrule => {
    exrule.all().forEach(dt => rruleSet.exdate(dt))
  })

  //
  // 2. Pick from the set of reccurring dates to have enough to complete
  //

  const days = []
  let sum = 0;

  const daySeries = rruleSet.all()

  let i = 0;

  while (sum < weeks*unitsPerWeek*unit) { // FT: 45 days (9*5*1) / PT: 48 halfdays (24*4*.5)
    const d = daySeries[i];
    sum += unit
    days.push(d)
    
    i++;
  }

  return days;
}