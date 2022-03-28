const strings = require("../constants/strings");
const thumbnail = require("../../storage/thumbnail");
const history = require("../../storage/history");
const util = require("../../util");
const taptic = require("../../tools/taptic");

function insertTapped(states) {
  const tools = require("../../tools/link");
  util.insertIntoDocument(selectedText(states, tools.itemMarkdown));
}

function deleteTapped(views, states, contextActions) {
  const mainView = views.main();
  const { endBulkEditing, reloadFooter, reloadToolbar } = contextActions;

  $ui.alert({
    title: strings.delete_selected,
    message: strings.cannot_undo,
    actions: [
      {
        title: strings.delete,
        style: $alertActionType.destructive,
        handler: () => {
          const indices = states.selectedIndices;
          indices.sort((lhs, rhs) => rhs - lhs);
          for (const index of indices) {
            thumbnail.remove(states.data[index]);
            states.data.splice(index, 1);
            mainView.delete(index);
          }

          history.save(states.data);
          states.selectedIndices = [];

          if (states.data.length === 0) {
            endBulkEditing(true);
          }

          reloadFooter();
          reloadToolbar();
          taptic.light();
        }
      },
      {
        title: strings.cancel,
        style: $alertActionType.cancel
      }
    ]
  });
}

function selectedText(states, transformer) {
  return states.selectedIndices.map(index => transformer(states.data[index])).join("\n\n");
}

module.exports = {
  insertTapped,
  deleteTapped,
  selectedText
}