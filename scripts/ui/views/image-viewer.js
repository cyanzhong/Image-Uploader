const builder = require("../builder");
const colors = require("../constants/colors");
const symbols = require("../constants/symbols");
const strings = require("../constants/strings");
const dimensions = require("../constants/dimensions");
const filesize = require("../../libs/filesize");
const dateTools = require("../../tools/date");
const linkTools = require("../../tools/link");
const taptic = require("../../tools/taptic");
const util = require("../../util");

const states = {
  cachedWidth: 0
}

const views = {
  container: () => $("preview-container"),
  toolbar: () => $("image-viewer-toolbar"),
  zoomableView: () => $("preview-zoomable"),
  spinner: () => $("preview-spinner"),
  imageView: () => $("preview-image"),
  deletedLabel: () => $("deleted-label"),
}

function push(item, sourceView, handlers) {
  const title = linkTools.itemTitle(item);
  const metadata = item.metadata;
  const readableSize = filesize(metadata.size);
  const readableDate = dateTools.readableDateFrom(item.creationDate);

  $ui.push({
    props: {
      title,
      navButtons: [
        { title: strings.share, symbol: symbols.share, handler: _ => shareTapped(title) }
      ]
    },
    views: [
      ...builder.makeToolbar("image-viewer-toolbar"),
      {
        type: "view",
        props: {
          id: "preview-container",
          clipsToBounds: true,
          userInteractionEnabled: false
        },
        layout: $layout.fill,
        views: [
          {
            type: "scroll",
            props: {
              id: "preview-zoomable",
              zoomEnabled: true,
              maxZoomScale: Math.max(sourceView.size.width * 1.5 / metadata.width, sourceView.size.height * 1.5 / metadata.height),
              clipsToBounds: false
            },
            views: [
              {
                type: "spinner",
                props: {
                  id: "preview-spinner",
                  style: 0,
                  loading: true
                },
                layout: $layout.center
              },
              {
                type: "image",
                props: {
                  id: "preview-image",
                  isAccessibilityElement: true,
                  hidden: true
                },
                events: {
                  ready: sender => imageViewLoaded(item, sender)
                }
              }
            ]
          },
          {
            type: "label",
            props: {
              id: "deleted-label",
              hidden: true,
              text: strings.cannot_load_image
            }
          }
        ],
        events: {
          ready: () => views.container().moveToBack(),
          layoutSubviews
        }
      },
      {
        type: "button",
        props: {
          bgcolor: colors.clear,
          accessibilityLabel: strings.options,
          menu: buildActionMenu(item, handlers)
        },
        layout: (make, view) => {
          make.centerY.equalTo(views.toolbar());
          make.right.equalTo(view.super.safeAreaRight).inset(10);
          make.size.equalTo($size(44, 44));
        },
        views: [
          {
            type: "image",
            props: {
              symbol: symbols.more,
              tintColor: colors.blue
            },
            layout: (make, view) => {
              make.center.equalTo(view.super);
              make.size.equalTo($size(28, 28));
            }
          }
        ]
      },
      {
        type: "label",
        props: {
          align: $align.center,
          lines: 2,
          font: $font(dimensions.footerFontSize),
          text: `${metadata.width}w * ${metadata.height}h, ${readableSize}\n${readableDate}`,
          accessibilityLabel: `${strings.image_width} ${metadata.width}, ${strings.image_height} ${metadata.height}, ${readableSize}\n${readableDate}`
        },
        layout: make => {
          make.top.bottom.equalTo(views.toolbar());
          make.left.right.inset(60);
        }
      }
    ]
  });
}

function buildActionMenu(item, handlers) {
  return {
    title: item.remotePath,
    pullDown: true, asPrimary: true,
    items: (() => {
      const items = [
        { title: strings.delete, symbol: symbols.trash, destructive: true, handler: _ => handlers.deleteItem() },
        { title: strings.open_in_browser, symbol: symbols.safari, handler: _ => handlers.openInBrowser() },
        { title: strings.copy_bbcode, symbol: symbols.bbcode, handler: _ => handlers.copyBBCode() },
        { title: strings.copy_markdown, symbol: symbols.markdown, handler: _ => handlers.copyMarkdown() },
        { title: strings.copy_html, symbol: symbols.html, handler: _ => handlers.copyHTML() },
        { title: strings.copy_url, symbol: symbols.link, handler: _ => handlers.copyURL() },
      ]

      if (util.onTaio) {
        items.push({ title: strings.insert_into_document, symbol: symbols.text_insert, handler: _ => handlers.insertIntoDocument() });
      }

      if (util.onMac) {
        return items.reverse();
      } else {
        return items;
      }
    })()
  }
}

function imageViewLoaded(item, sender) {
  sender.set({
    src: item.remotePath,
    handler: async(result) => {
      await $wait(0); // To prevent resizing flash
      views.imageView().hidden = false;
      views.spinner().loading = false;
      views.container().userInteractionEnabled = !result.error;
      views.deletedLabel().hidden = !result.error;
    }
  });

  // On Mac, there's no way to show remote path on contextual menu,
  // we add a tooltip to work around this
  if (util.onMac) {
    const tooltip = $objc("UIToolTipInteraction").$alloc().$initWithDefaultToolTip(item.remotePath);
    if (tooltip) {
      sender.ocValue().$addInteraction(tooltip);
    }
  }
}

function layoutSubviews(sender) {
  const frame = (util.onTaio && !util.onMac) ? sender.bounds : $rect(0, 0, sender.frame.width, views.toolbar().frame.y);
  const zoomableView = views.zoomableView();
  zoomableView.frame = frame;

  const deletedLabel = views.deletedLabel();
  deletedLabel.sizeToFit();
  deletedLabel.center = zoomableView.center;

  const viewWidth = sender.frame.width;
  if (states.cachedWidth !== viewWidth) {
    states.cachedWidth = viewWidth;
    // Center the view
    if (typeof zoomableView.updateZoomScale === "function") {
      zoomableView.updateZoomScale();
    } else {
      // Workaround when we don't have "updateZoomScale"
      const imageView = views.imageView();
      imageView.image = imageView.image;
    }
  }
}

function shareTapped(name) {
  const image = views.imageView().image;
  if (!image) {
    taptic.error();
    return;
  }

  if (util.onMac) {
    const data = name.toLowerCase().endsWith(".png") ? image.png : image.jpg(1);
    $share.sheet({ name, data });
  } else {
    $share.sheet(image);
  }
}

module.exports = {
  push
}