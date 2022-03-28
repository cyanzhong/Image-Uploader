function exec(text, pattern, group = 1) {
  // We do this because regex in JavaScript cannot capture group indice
  const regex = $objc("NSRegularExpression").$regularExpressionWithPattern_options_error(pattern, 1 << 0 /* case-insensitive */, null);
  const range = { "location": 0, "length": text.length };
  const matches = regex.$matchesInString_options_range(text, 0, range);
  const results = [];

  for (let index = 0; index < matches.$count(); ++index) {
    const match = matches.$objectAtIndex(index);
    const range = match.$rangeAtIndex(group);
    const path = text.substring(range.location, range.location + range.length);
    results.push({ range, path });
  }

  return results;
}

module.exports = {
  exec
}