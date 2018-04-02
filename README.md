adapt-labelGeneratorMobile
===================

A basic Adapt label generator component.

Installation
------------

First, be sure to install the [Adapt Command Line Interface](https://github.com/adaptlearning/adapt-cli), then from the command line run:-

		adapt install adapt-labelGeneratorMobile

Usage
-----
Once installed, the component can be used as a label generator component.

For example JSON format, see [example.json](https://github.com/BATraining/adapt-labelGeneratorMobile/blob/master/example.json)

Further settings for this component are:

####_component

This value must be: `labelGeneratorMobile`

####_classes

You can use this setting to add custom classes to your template and LESS file.

####_layout

This defines the position of the component in the block. Values can be `full`, `left` or `right`.

####mobileBody

This is optional body text that will be shown when viewed on mobile.

####mobileInstruction

This is optional instruction text that will be shown when viewed on mobile.

####_isHighlightEnable

Default is `false` and `true` if the label should have border after selection.

####_graphic

The main label generator image is defined within this element. This element should contain only one value for `src`, `alt` and `title`.

####src

Enter a path to the image. Paths should be relative to the src folder, e.g.

course/en/images/gqcq-1-large.gif

####alt

A value for alternative text can be entered here.

####title

Title text can be entered here for the image.

####_items

Multiple items can be entered. Each item represents one label for this component and contains values for `id` , `title`, `body` , `_graphic`.

####id

Id number of item

####title

This is the title text for a label popup.

####body

This is the main text for a label popup if popup had more description.

####_graphic

Each popup's more description can contain an image. Details for the image are entered within this setting.

####src

Enter a path to the image. Paths should be relative to the src folder, e.g.

course/en/images/gqcq-1-large.gif

####alt

A value for alternative text can be entered here.

####title

This setting is for the title attribute on the image.

####strapline

Enter text for a strapline. This will be displayed when viewport size changes to the smallest range and is shown as a title above the image.

####_hasExtraDescription

Default is `false` and `true` if label's popup has more description

####_similarItemId

This is array which contains the list elements which has similar popup like this label and this array can be empty there is no similar popup.

####_similarItemIdForPopup

Default is `0` or contain the id no of itself for showing the common popup for all the similar label.

####_itemTop

Each label must contain `_top` and `_left` coordinates to position them on the label generator.

Enter the number of pixels this label should be from the top border of the main graphic.

####_itemLeft

Enter the number of pixels this label should be from the left border of the main graphic.

####_popupPosition

Default is `right` can have value `left` if the label icon is at extreme right side

####_highlightTop

If `_isHighlightEnable` is `true`.

Enter the number of pixels this highlight should be from the top border of the main graphic.

####_highlightLeft

Enter the number of pixels this highlight should be from the left border of the main graphic.

####_highlightWidth

Enter the width of highlight.

####_highlightHeight

Enter the height of highlight.




