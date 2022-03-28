// There is currently no built-in support, use runtime for now
const generator = $objc("UINotificationFeedbackGenerator").$new();

function light() {
  $device.taptic(1);
}

function success() {
  generator.$notificationOccurred(0);
}

function error() {
  generator.$notificationOccurred(2);
}

module.exports = {
  light,
  success,
  error
}