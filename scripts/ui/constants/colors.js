const util = require("../../util");

module.exports = {
  clear: $color("clear"),
  tint: util.onTaio ? $color("tint") : $color("black", "white"),
  white: $color("white"),
  errorBackground: $color("#ffebeb", "#4e3431"),
  errorStroke: $color("#c91d1d", "#ff8066"),
  blue: $color("#007aff", "#0084ff"),
  gray: $color("gray"),
  lightGray: $color("lightGray"),
  lightBackground: $color($rgba(0, 0, 0, 0.05), $rgba(255, 255, 255, 0.1)),
  toolbarDivider: $color("#c8c8c8", "#262626"),
}