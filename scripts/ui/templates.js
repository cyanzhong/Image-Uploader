const colors = require("./constants/colors");
const strings = require("./constants/strings");
const util = require("../util");

const list = {
  props: {
    accessoryType: 1 // .disclosureIndicator
  },
  views: [
    {
      type: "label",
      props: {
        id: "title"
      },
      layout: (make, view) => {
        make.centerY.equalTo(view.super);
        make.left.right.inset(15);
      }
    }
  ]
}

const table = [
  {
    type: "image",
    props: {
      id: "image",
      isAccessibilityElement: true,
      bgcolor: colors.lightBackground,
      contentMode: $contentMode.scaleAspectFit
    },
    layout: $layout.fill
  },
  {
    type: "spinner",
    props: {
      id: "spinner",
      style: 0
    },
    layout: (make, view) => {
      make.center.equalTo(view.super);
    }
  },
  {
    type: "view",
    props: {
      id: "failed",
      hidden: true,
      bgcolor: colors.errorBackground
    },
    layout: make => {
      make.left.bottom.right.equalTo(0);
      make.height.equalTo(20);
    },
    views: [
      {
        type: "label",
        props: {
          font: $font(13),
          textColor: colors.errorStroke,
          text: strings.upload_failed
        },
        layout: (make, view) => {
          make.center.equalTo(view.super);
        }
      }
    ]
  },
  {
    type: "view",
    props: {
      id: "cycle", // To make a "filled" checkmark
      hidden: true,
      bgcolor: colors.white,
      cornerRadius: 9
    },
    layout: make => {
      make.bottom.right.inset(8);
      make.size.equalTo($size(18, 18));
    }
  },
  {
    type: "image",
    props: {
      id: "checkmark",
      hidden: true,
      tintColor: colors.blue
    },
    layout: make => {
      make.bottom.right.inset(5);
      make.size.equalTo($size(25, 25));
    }
  }
]

const errors = [
  {
    type: "image",
    props: {
      id: "image",
      bgcolor: colors.lightBackground,
      contentMode: $contentMode.scaleAspectFit
    },
    layout: (make, view) => {
      make.left.top.bottom.inset(5);
      make.width.equalTo(view.height);
    }
  },
  {
    type: "label",
    props: {
      id: "label",
      align: $align.center,
      lines: 0
    },
    layout: make => {
      make.left.equalTo($("image").right).offset(8);
      make.top.right.bottom.inset(8);
    }
  }
]

module.exports = {
  list,
  table,
  errors
}