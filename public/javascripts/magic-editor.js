// figure out if the anchor is ahead of the focus

var selectSpans = function(selection) {
  $('span').css('background-color', 'transparent');

  // if (!window.getSelection().anchorNode) {
  //   alert('you must select something');
  // }

  var sel = selection; //window.getSelection();
  // var range = sel.getRangeAt(0);
  anchor = {node: $(sel.anchorNode.parentNode), offset: sel.anchorOffset};
  focus = {node: $(sel.focusNode.parentNode), offset: sel.focusOffset};
  cross_paragraph = $(anchor.node).parent().text() !== $(focus.node).parent().text();
  cross_span = ($(anchor.node).text() !== $(focus.node).text());
  left_buffer = [];
  right_buffer = [];
  selected_elements = [];

  // is anchor ahead of ('to left of') focus
  var left_to_rt;
  if(cross_paragraph) {
    left_to_rt = (anchor.node.parent().index() < focus.node.parent().index());
  } else {
    left_to_rt =
     cross_span
     ? ($(anchor.node).index() < $(focus.node).index())
     : (anchor.offset < focus.offset);
  }
  var left_selection  = left_to_rt ? anchor : focus;
  var right_selection = left_to_rt ? focus  : anchor;

  // console.log('yay');
  // console.log(cross_span);
  // console.log($(anchor.node.index()) < $(focus.node.index()));
  // $(left_selection.node).css('background-color', 'green');
  // $(right_selection.node).css('background-color', 'red');

  // create left_buffer if necessary
  if (left_selection.offset != 0) {
    left_buffer = left_selection.node.clone();
    text = left_selection.node.text();
    left_buffer.text(text.substring(0, left_selection.offset));
    left_selection.node.before(left_buffer);
    // left_buffer.css('background-color', '#8bb946');
  }

  // create right_buffer if necessary
  if (right_selection.offset != right_selection.node.text().length) {
    right_buffer = right_selection.node.clone();
    text = right_buffer.text();
    right_buffer.text(text.substring(right_selection.offset, text.length));
    right_selection.node.after(right_buffer);
    // right_buffer.css('background-color', '#cf4330');
  }

  // trim the left & right selections if necessary
  if (!cross_span) {
    text = left_selection.node.text();
    left_selection.node.text(text.substring(left_selection.offset, right_selection.offset));
    selected_elements = left_selection.node;
  } else {
    text = left_selection.node.text();
    left_selection.node.text(text.substring(left_selection.offset, text.length));
    text = right_selection.node.text();
    right_selection.node.text(text.substring(0, right_selection.offset));

    // get selected spans
    if (!cross_paragraph) {
      selected_elements = left_selection.node.parent().children().slice(left_selection.node.index(), right_selection.node.index()+1);
    } else {
      left_spans = left_selection.node.parent().children();
      left_spans = left_spans.slice(left_selection.node.index(), left_spans.length);

      paragraphs = left_selection.node.parent().parent().children('p');
      paragraph_spans = paragraphs.slice(left_selection.node.parent().index()+1, right_selection.node.parent().index()).children('span');

      right_spans = right_selection.node.parent().children();
      right_spans = right_spans.slice(0, right_selection.node.index() + 1);
      selected_elements = $.merge(left_spans, $.merge(paragraph_spans, right_spans));
    }
  }
}

// merge selected elements plus buffers if they have the same classes
var mergeSpans = function() {
  all_spans = $($.merge($.merge($.merge([], left_buffer), selected_elements), right_buffer));

  // get list of affected paragraphs
  // split up the spans by paragraph
  if (cross_paragraph) {
    var paragraphs = _.uniq(_.map(all_spans, function(i){
      return $(i).parent().index()
    }));
    all_spans = _.map(paragraphs, function(paragraph_index){
      return _.select(all_spans, function(span){
        return $(span).parent().index() == paragraph_index;
      });
    });
  } else {
    all_spans = Array(all_spans);
  }

  _.each(all_spans, function(spans){
    prev = $(spans[0]);
    for(var i = 1; i < spans.length; i++) {
      var current = $(spans[i]);
      if (prev.attr('class') === current.attr('class')) {
        current.text(prev.text() + current.text());
        prev.remove();
      }
      prev = current;
    }
  });
}

var transformText = function(elements, oldClass, newClass) {
  _.each(elements, function(element){
    element.className = element.className.replace(oldClass, '');
  });

  $(elements).addClass(newClass);

  _.each(elements, function(element){
    element.className = element.className.replace(/\s{2,}/g,' ').replace(/^\s/,'');
  });

}

var changeColor = function(elements, color){
  var oldClass = new RegExp('c\\w+', 'g');
  var newClass = 'c' + color;
  transformText(elements, oldClass, newClass);
}

var changeFontSize = function(elements, size){
  var oldClass = new RegExp('s\\d+', 'g');
  var newClass = 's' + size;
  transformText(elements, oldClass, newClass);
}

var editor = function(type, param, selection) {
  console.log('editor called');
  console.log(selection);
  if (selection && !selection.isCollapsed) {
    selectSpans(selection);

    switch (type) {
      case 'color':
        changeColor(selected_elements, param);
        break;
      case 'size':
        changeFontSize(selected_elements, param);
        break;
    }

    mergeSpans();
  }
}

