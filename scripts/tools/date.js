const formatter = $objc("NSDateFormatter").$new();
formatter.$setDateStyle(3);
formatter.$setTimeStyle(2);

function readableDateFrom(interval) {
  // We do this because JavaScript doesn't have a nice date formatting api
  const date = $objc("NSDate").$dateWithTimeIntervalSince1970(interval / 1000);
  return formatter.$stringFromDate(date).jsValue();
}

module.exports = {
  readableDateFrom
}